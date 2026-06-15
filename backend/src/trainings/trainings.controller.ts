import { Controller, Get, Query } from '@nestjs/common';
import { TrainingsService } from './trainings.service';

@Controller('trainings')
export class TrainingsController {
  constructor(private readonly svc: TrainingsService) {}

  @Get()
  findAll(
    @Query('businessUnit') businessUnit?: string,
    @Query('country') country?: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('isMandatory') isMandatory?: string,
  ) {
    return this.svc.findAll({ businessUnit, country, status, category, isMandatory });
  }

  @Get('filter-options')
  getFilterOptions() {
    return this.svc.getFilterOptions();
  }
}
