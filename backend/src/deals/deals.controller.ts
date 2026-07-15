import { Body, Controller, Delete, Get, Param, Patch, Put, Query, UseGuards } from '@nestjs/common';
import { DealsService } from './deals.service';
import { UpdateDealDto } from './dto/update-deal.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { QueryDealDto } from './dto/query-deal.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';

@Controller('deals')
@UseGuards(JwtAuthGuard)
export class DealsController {
  constructor(private dealsService: DealsService) {}

  @Get()
  findAll(@Query() query: QueryDealDto, @CurrentUser() user: any) {
    return this.dealsService.findAll(query, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.dealsService.findOne(id, user);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDealDto, @CurrentUser() user: any) {
    return this.dealsService.update(id, dto, user);
  }

  @Patch(':id/stage')
  updateStage(@Param('id') id: string, @Body() dto: UpdateStageDto, @CurrentUser() user: any) {
    return this.dealsService.updateStage(id, dto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.dealsService.remove(id, user);
  }
}
