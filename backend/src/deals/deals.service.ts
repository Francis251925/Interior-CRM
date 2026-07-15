import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateDealDto } from './dto/update-deal.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { QueryDealDto } from './dto/query-deal.dto';

interface AuthUser {
  id: string;
  role: Role;
}

@Injectable()
export class DealsService {
  constructor(private prisma: PrismaService) {}

  private scopeWhereForUser(currentUser: AuthUser) {
    if (currentUser.role === Role.SALES_EXECUTIVE) {
      return { assignedToId: currentUser.id };
    }
    return {};
  }

  async findAll(query: QueryDealDto, currentUser: AuthUser) {
    const where: any = { ...this.scopeWhereForUser(currentUser) };

    if (query.search) {
      where.OR = [
        { customerName: { contains: query.search, mode: 'insensitive' } },
        { dealNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.stage) where.stage = query.stage;
    if (query.propertyType) where.propertyType = query.propertyType;
    if (query.assignedToId) where.assignedToId = query.assignedToId;
    if (query.minBudget || query.maxBudget) {
      where.estimatedBudget = {};
      if (query.minBudget) where.estimatedBudget.gte = Number(query.minBudget);
      if (query.maxBudget) where.estimatedBudget.lte = Number(query.maxBudget);
    }

    return this.prisma.deal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        assignedTo: { select: { id: true, employeeName: true, role: true } },
        lead: { select: { leadNumber: true, mobile: true, email: true, location: true } },
      },
    });
  }

  async findOne(id: string, currentUser: AuthUser) {
    const deal = await this.prisma.deal.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, employeeName: true, role: true } },
        lead: true,
        activities: { orderBy: { createdAt: 'desc' }, include: { user: { select: { employeeName: true } } } },
      },
    });
    if (!deal) throw new NotFoundException('Deal not found');
    if (currentUser.role === Role.SALES_EXECUTIVE && deal.assignedToId !== currentUser.id) {
      throw new ForbiddenException('You can only view your assigned deals');
    }
    return deal;
  }

  private assertEditable(deal: any, currentUser: AuthUser) {
    if (currentUser.role === Role.SALES_EXECUTIVE && deal.assignedToId !== currentUser.id) {
      throw new ForbiddenException('You can only edit your assigned deals');
    }
    if (deal.stage === 'CONFIRMED' && currentUser.role !== Role.ADMIN) {
      throw new ForbiddenException('A confirmed deal is read-only except for administrators');
    }
  }

  async update(id: string, dto: UpdateDealDto, currentUser: AuthUser) {
    const deal = await this.prisma.deal.findUnique({ where: { id } });
    if (!deal) throw new NotFoundException('Deal not found');
    this.assertEditable(deal, currentUser);

    if (dto.expectedClosureDate) {
      const closureDate = new Date(dto.expectedClosureDate);
      if (closureDate < new Date(deal.createdAt)) {
        throw new BadRequestException('Expected closure date cannot be earlier than the deal creation date');
      }
    }
    if (dto.assignedToId && currentUser.role === Role.SALES_EXECUTIVE) {
      throw new ForbiddenException('Only Admin or Sales Manager can reassign deals');
    }

    return this.prisma.deal.update({ where: { id }, data: dto as any });
  }

  async updateStage(id: string, dto: UpdateStageDto, currentUser: AuthUser) {
    const deal = await this.prisma.deal.findUnique({ where: { id } });
    if (!deal) throw new NotFoundException('Deal not found');
    this.assertEditable(deal, currentUser);

    if (dto.stage === 'LOST' && !dto.lostReason) {
      throw new BadRequestException('A reason is required when marking a deal as Lost');
    }

    const updated = await this.prisma.deal.update({
      where: { id },
      data: { stage: dto.stage, lostReason: dto.lostReason },
    });

    await this.prisma.dealActivity.create({
      data: {
        dealId: id,
        userId: currentUser.id,
        message: `Stage changed from ${deal.stage} to ${dto.stage}.`,
      },
    });

    return updated;
  }

  async remove(id: string, currentUser: AuthUser) {
    if (currentUser.role !== Role.ADMIN) {
      throw new ForbiddenException('Only Admin can delete deals');
    }
    const deal = await this.prisma.deal.findUnique({ where: { id } });
    if (!deal) throw new NotFoundException('Deal not found');
    await this.prisma.deal.delete({ where: { id } });
    return { message: 'Deal deleted' };
  }
}
