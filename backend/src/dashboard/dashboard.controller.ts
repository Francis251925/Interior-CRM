import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('summary')
  summary(@CurrentUser() user: any) {
    return this.dashboardService.summary(user);
  }

  @Get('leads')
  leads(@CurrentUser() user: any) {
    return this.dashboardService.leadStats(user);
  }

  @Get('deals')
  deals(@CurrentUser() user: any) {
    return this.dashboardService.dealStats(user);
  }
}
