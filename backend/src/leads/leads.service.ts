import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { QueryLeadDto } from './dto/query-lead.dto';

interface AuthUser {
  id: string;
  role: Role;
}

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  private async generateLeadNumber(): Promise<string> {
    const count = await this.prisma.lead.count();
    const year = new Date().getFullYear();
    return `LD-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  async create(dto: CreateLeadDto, currentUser: AuthUser) {
    const existingMobile = await this.prisma.lead.findUnique({ where: { mobile: dto.mobile } });
    if (existingMobile) {
      throw new ConflictException('A lead with this mobile number already exists');
    }

    const leadNumber = await this.generateLeadNumber();
    const lead = await this.prisma.lead.create({
      data: {
        leadNumber,
        customerName: dto.customerName,
        mobile: dto.mobile,
        email: dto.email,
        location: dto.location,
        propertyType: dto.propertyType,
        propertySize: dto.propertySize,
        budget: dto.budget,
        source: dto.source,
        notes: dto.notes,
        assignedToId: dto.assignedToId,
      },
    });

    await this.prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        userId: currentUser.id,
        message: `Lead created and assigned.`,
      },
    });

    return lead;
  }

  private scopeWhereForUser(currentUser: AuthUser) {
    if (currentUser.role === Role.SALES_EXECUTIVE) {
      return { assignedToId: currentUser.id };
    }
    return {};
  }

  async findAll(query: QueryLeadDto, currentUser: AuthUser) {
    const where: any = { ...this.scopeWhereForUser(currentUser) };

    if (query.search) {
      where.OR = [
        { customerName: { contains: query.search, mode: 'insensitive' } },
        { mobile: { contains: query.search } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { leadNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.status) where.status = query.status;
    if (query.source) where.source = query.source;
    if (query.propertyType) where.propertyType = query.propertyType;
    if (query.assignedToId) where.assignedToId = query.assignedToId;
    if (query.minBudget || query.maxBudget) {
      where.budget = {};
      if (query.minBudget) where.budget.gte = Number(query.minBudget);
      if (query.maxBudget) where.budget.lte = Number(query.maxBudget);
    }

    const orderBy: any = {};
    orderBy[query.sortBy || 'createdAt'] = query.sortOrder || 'desc';

    return this.prisma.lead.findMany({
      where,
      orderBy,
      include: {
        assignedTo: { select: { id: true, employeeName: true, role: true } },
      },
    });
  }

  async findOne(id: string, currentUser: AuthUser) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, employeeName: true, role: true } },
        activities: { orderBy: { createdAt: 'desc' }, include: { user: { select: { employeeName: true } } } },
        deal: true,
      },
    });
    if (!lead) throw new NotFoundException('Lead not found');

    if (currentUser.role === Role.SALES_EXECUTIVE && lead.assignedToId !== currentUser.id) {
      throw new ForbiddenException('You can only view your assigned leads');
    }
    return lead;
  }

  async update(id: string, dto: UpdateLeadDto, currentUser: AuthUser) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');

    if (currentUser.role === Role.SALES_EXECUTIVE && lead.assignedToId !== currentUser.id) {
      throw new ForbiddenException('You can only edit your assigned leads');
    }

    // Only Admin / Sales Manager can reassign leads to a different executive
    if (dto.assignedToId && dto.assignedToId !== lead.assignedToId && currentUser.role === Role.SALES_EXECUTIVE) {
      throw new ForbiddenException('Only Admin or Sales Manager can reassign leads');
    }

    const updated = await this.prisma.lead.update({ where: { id }, data: dto as any });

    if (dto.status && dto.status !== lead.status) {
      await this.prisma.leadActivity.create({
        data: {
          leadId: id,
          userId: currentUser.id,
          message: `Status changed from ${lead.status} to ${dto.status}.`,
        },
      });
    }

    return updated;
  }

  async remove(id: string, currentUser: AuthUser) {
    if (currentUser.role !== Role.ADMIN) {
      throw new ForbiddenException('Only Admin can delete leads');
    }
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');
    await this.prisma.lead.delete({ where: { id } });
    return { message: 'Lead deleted' };
  }

  async addNote(id: string, message: string, currentUser: AuthUser) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException('Lead not found');
    if (currentUser.role === Role.SALES_EXECUTIVE && lead.assignedToId !== currentUser.id) {
      throw new ForbiddenException('You can only update your assigned leads');
    }
    return this.prisma.leadActivity.create({
      data: { leadId: id, userId: currentUser.id, message },
    });
  }

  async convertToDeal(
    id: string,
    body: { estimatedBudget: number; expectedClosureDate: string; probability?: number; remarks?: string },
    currentUser: AuthUser,
  ) {
    const lead = await this.prisma.lead.findUnique({ where: { id }, include: { deal: true } });
    if (!lead) throw new NotFoundException('Lead not found');

    if (currentUser.role === Role.SALES_EXECUTIVE && lead.assignedToId !== currentUser.id) {
      throw new ForbiddenException('You can only convert your assigned leads');
    }
    if (lead.status !== 'WON') {
      throw new BadRequestException('Only a lead marked as Won can be converted into a Deal');
    }
    if (lead.deal) {
      throw new ConflictException('This lead has already been converted into a deal');
    }

    const closureDate = new Date(body.expectedClosureDate);
    if (closureDate < new Date(lead.createdAt)) {
      throw new BadRequestException('Expected closure date cannot be earlier than the lead creation date');
    }

    const count = await this.prisma.deal.count();
    const dealNumber = `DL-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const deal = await this.prisma.deal.create({
      data: {
        dealNumber,
        leadId: lead.id,
        customerName: lead.customerName,
        propertyType: lead.propertyType,
        estimatedBudget: body.estimatedBudget,
        expectedClosureDate: closureDate,
        probability: body.probability ?? 50,
        assignedToId: lead.assignedToId,
        remarks: body.remarks,
      },
    });

    await this.prisma.dealActivity.create({
      data: { dealId: deal.id, userId: currentUser.id, message: 'Deal created from won lead.' },
    });

    return deal;
  }
}
