import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

interface AuthUser {
  id: string;
  role: Role;
}

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  private scopeWhereForUser(currentUser: AuthUser) {
    if (currentUser.role === Role.SALES_EXECUTIVE) {
      return { assignedToId: currentUser.id };
    }
    return {};
  }

  async leadStats(currentUser: AuthUser) {
    const where = this.scopeWhereForUser(currentUser);
    const [total, byStatus] = await Promise.all([
      this.prisma.lead.count({ where }),
      this.prisma.lead.groupBy({ by: ['status'], where, _count: true }),
    ]);

    const statusMap: Record<string, number> = {};
    byStatus.forEach((row) => (statusMap[row.status] = row._count));

    const won = statusMap['WON'] || 0;
    const lost = statusMap['LOST'] || 0;
    const conversionRate = total > 0 ? Number(((won / total) * 100).toFixed(1)) : 0;

    return {
      totalLeads: total,
      newLeads: statusMap['NEW'] || 0,
      contactedLeads: statusMap['CONTACTED'] || 0,
      pendingSiteVisits: statusMap['SITE_VISIT_PLANNED'] || 0,
      quotationsPending: statusMap['QUOTATION_PENDING'] || 0,
      quotationsSent: statusMap['QUOTATION_SENT'] || 0,
      wonLeads: won,
      lostLeads: lost,
      conversionRate,
    };
  }

  async dealStats(currentUser: AuthUser) {
    const where = this.scopeWhereForUser(currentUser);
    const [total, byStage, aggregates] = await Promise.all([
      this.prisma.deal.count({ where }),
      this.prisma.deal.groupBy({ by: ['stage'], where, _count: true }),
      this.prisma.deal.aggregate({ where, _sum: { estimatedBudget: true }, _avg: { estimatedBudget: true } }),
    ]);

    const stageMap: Record<string, number> = {};
    byStage.forEach((row) => (stageMap[row.stage] = row._count));

    const confirmed = stageMap['CONFIRMED'] || 0;
    const lost = stageMap['LOST'] || 0;
    const active = total - confirmed - lost;
    const winRatio = confirmed + lost > 0 ? Number(((confirmed / (confirmed + lost)) * 100).toFixed(1)) : 0;

    const confirmedDeals = await this.prisma.deal.aggregate({
      where: { ...where, stage: 'CONFIRMED' },
      _sum: { estimatedBudget: true },
    });

    return {
      totalDeals: total,
      activeDeals: active,
      dealsByStage: stageMap,
      confirmedDeals: confirmed,
      lostDeals: lost,
      totalPipelineValue: aggregates._sum.estimatedBudget || 0,
      expectedRevenue: confirmedDeals._sum.estimatedBudget || 0,
      winRatio,
      averageDealValue: Math.round(aggregates._avg.estimatedBudget || 0),
    };
  }

  async summary(currentUser: AuthUser) {
    const [leads, deals] = await Promise.all([this.leadStats(currentUser), this.dealStats(currentUser)]);
    return { leads, deals };
  }
}
