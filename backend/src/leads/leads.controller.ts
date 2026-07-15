import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { QueryLeadDto } from './dto/query-lead.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';

@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  @Post()
  create(@Body() dto: CreateLeadDto, @CurrentUser() user: any) {
    return this.leadsService.create(dto, user);
  }

  @Get()
  findAll(@Query() query: QueryLeadDto, @CurrentUser() user: any) {
    return this.leadsService.findAll(query, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.leadsService.findOne(id, user);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLeadDto, @CurrentUser() user: any) {
    return this.leadsService.update(id, dto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.leadsService.remove(id, user);
  }

  @Post(':id/notes')
  addNote(@Param('id') id: string, @Body('message') message: string, @CurrentUser() user: any) {
    return this.leadsService.addNote(id, message, user);
  }

  @Post(':id/convert')
  convert(@Param('id') id: string, @Body() body: any, @CurrentUser() user: any) {
    return this.leadsService.convertToDeal(id, body, user);
  }
}
