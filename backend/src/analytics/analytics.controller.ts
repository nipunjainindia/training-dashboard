import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly svc: AnalyticsService) {}

  @Get('kpis')
  getKpis() {
    return this.svc.getKpis();
  }

  @Get('status-breakdown')
  getStatusBreakdown() {
    return this.svc.getStatusBreakdown();
  }

  @Get('category-breakdown')
  getCategoryBreakdown() {
    return this.svc.getCategoryBreakdown();
  }

  @Get('business-unit-breakdown')
  getBusinessUnitBreakdown() {
    return this.svc.getBusinessUnitBreakdown();
  }

  @Get('country-breakdown')
  getCountryBreakdown() {
    return this.svc.getCountryBreakdown();
  }

  @Get('enrollment-trend')
  getEnrollmentTrend() {
    return this.svc.getEnrollmentTrend();
  }

  @Get('score-by-category')
  getScoreByCategory() {
    return this.svc.getScoreByCategory();
  }

  @Get('provider-breakdown')
  getProviderBreakdown() {
    return this.svc.getProviderBreakdown();
  }

  @Get('mandatory-breakdown')
  getMandatoryBreakdown() {
    return this.svc.getMandatoryBreakdown();
  }

  @Get('top-trainings')
  getTopTrainings() {
    return this.svc.getTopTrainings();
  }
}
