import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Training } from '../trainings/training.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Training)
    private readonly repo: Repository<Training>,
  ) {}

  /** KPI summary cards */
  async getKpis() {
    const [total, completed, overdue, inProgress, notStarted] = await Promise.all([
      this.repo.count(),
      this.repo.count({ where: { Status: 'Completed' } }),
      this.repo.count({ where: { Status: 'Overdue' } }),
      this.repo.count({ where: { Status: 'In Progress' } }),
      this.repo.count({ where: { Status: 'Not Started' } }),
    ]);

    const avgScoreResult = await this.repo
      .createQueryBuilder('t')
      .select('AVG(t.AssessmentScore)', 'avg')
      .where('t.AssessmentScore IS NOT NULL')
      .getRawOne();

    const totalHoursResult = await this.repo
      .createQueryBuilder('t')
      .select('SUM(t.TrainingHours)', 'total')
      .getRawOne();

    return {
      total,
      completed,
      overdue,
      inProgress,
      notStarted,
      completionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : 0,
      avgAssessmentScore: avgScoreResult?.avg
        ? parseFloat(avgScoreResult.avg).toFixed(1)
        : 0,
      totalTrainingHours: totalHoursResult?.total
        ? parseFloat(totalHoursResult.total).toFixed(0)
        : 0,
    };
  }

  /** Completion by status - for donut chart */
  async getStatusBreakdown() {
    const rows = await this.repo
      .createQueryBuilder('t')
      .select('t.Status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('t.Status')
      .getRawMany();
    return rows.map((r) => ({ name: r.status, value: +r.count }));
  }

  /** Trainings by category - for bar chart */
  async getCategoryBreakdown() {
    const rows = await this.repo
      .createQueryBuilder('t')
      .select('t.TrainingCategory', 'category')
      .addSelect('COUNT(*)', 'total')
      .addSelect(
        "SUM(CASE WHEN t.Status = 'Completed' THEN 1 ELSE 0 END)",
        'completed',
      )
      .groupBy('t.TrainingCategory')
      .orderBy('total', 'DESC')
      .getRawMany();
    return rows.map((r) => ({
      category: r.category,
      total: +r.total,
      completed: +r.completed,
    }));
  }

  /** Trainings by business unit - for bar/horizontal chart */
  async getBusinessUnitBreakdown() {
    const rows = await this.repo
      .createQueryBuilder('t')
      .select('t.BusinessUnit', 'bu')
      .addSelect('COUNT(*)', 'total')
      .addSelect(
        "SUM(CASE WHEN t.Status = 'Completed' THEN 1 ELSE 0 END)",
        'completed',
      )
      .addSelect(
        "SUM(CASE WHEN t.Status = 'Overdue' THEN 1 ELSE 0 END)",
        'overdue',
      )
      .groupBy('t.BusinessUnit')
      .orderBy('total', 'DESC')
      .getRawMany();
    return rows.map((r) => ({
      bu: r.bu,
      total: +r.total,
      completed: +r.completed,
      overdue: +r.overdue,
    }));
  }

  /** Trainings by country */
  async getCountryBreakdown() {
    const rows = await this.repo
      .createQueryBuilder('t')
      .select('t.Country', 'country')
      .addSelect('COUNT(*)', 'total')
      .addSelect(
        "SUM(CASE WHEN t.Status = 'Completed' THEN 1 ELSE 0 END)",
        'completed',
      )
      .groupBy('t.Country')
      .orderBy('total', 'DESC')
      .getRawMany();
    return rows.map((r) => ({
      country: r.country,
      total: +r.total,
      completed: +r.completed,
      rate: r.total > 0 ? ((+r.completed / +r.total) * 100).toFixed(1) : 0,
    }));
  }

  /** Monthly enrollment trend */
  async getEnrollmentTrend() {
    const rows = await this.repo
      .createQueryBuilder('t')
      .select("FORMAT(t.EnrollmentDate, 'yyyy-MM')", 'month')
      .addSelect('COUNT(*)', 'enrollments')
      .addSelect(
        "SUM(CASE WHEN t.Status = 'Completed' THEN 1 ELSE 0 END)",
        'completions',
      )
      .where('t.EnrollmentDate IS NOT NULL')
      .groupBy("FORMAT(t.EnrollmentDate, 'yyyy-MM')")
      .orderBy("FORMAT(t.EnrollmentDate, 'yyyy-MM')", 'ASC')
      .getRawMany();
    return rows.map((r) => ({
      month: r.month,
      enrollments: +r.enrollments,
      completions: +r.completions,
    }));
  }

  /** Average score by training category */
  async getScoreByCategory() {
    const rows = await this.repo
      .createQueryBuilder('t')
      .select('t.TrainingCategory', 'category')
      .addSelect('AVG(t.AssessmentScore)', 'avgScore')
      .where('t.AssessmentScore IS NOT NULL')
      .groupBy('t.TrainingCategory')
      .orderBy('avgScore', 'DESC')
      .getRawMany();
    return rows.map((r) => ({
      category: r.category,
      avgScore: parseFloat(r.avgScore).toFixed(1),
    }));
  }

  /** Provider distribution */
  async getProviderBreakdown() {
    const rows = await this.repo
      .createQueryBuilder('t')
      .select('t.TrainingProvider', 'provider')
      .addSelect('COUNT(*)', 'count')
      .groupBy('t.TrainingProvider')
      .orderBy('count', 'DESC')
      .getRawMany();
    return rows.map((r) => ({ name: r.provider, value: +r.count }));
  }

  /** Mandatory vs Optional breakdown */
  async getMandatoryBreakdown() {
    const rows = await this.repo
      .createQueryBuilder('t')
      .select('t.IsMandatory', 'mandatory')
      .addSelect('COUNT(*)', 'total')
      .addSelect(
        "SUM(CASE WHEN t.Status = 'Completed' THEN 1 ELSE 0 END)",
        'completed',
      )
      .groupBy('t.IsMandatory')
      .getRawMany();
    return rows.map((r) => ({
      type: r.mandatory ? 'Mandatory' : 'Optional',
      total: +r.total,
      completed: +r.completed,
      rate: r.total > 0 ? ((+r.completed / +r.total) * 100).toFixed(1) : 0,
    }));
  }

  /** Top 10 trainings by enrollment */
  async getTopTrainings() {
    const rows = await this.repo
      .createQueryBuilder('t')
      .select('t.TrainingName', 'name')
      .addSelect('t.TrainingCategory', 'category')
      .addSelect('COUNT(*)', 'enrollments')
      .addSelect(
        "SUM(CASE WHEN t.Status = 'Completed' THEN 1 ELSE 0 END)",
        'completed',
      )
      .addSelect('AVG(t.AssessmentScore)', 'avgScore')
      .groupBy('t.TrainingName, t.TrainingCategory')
      .orderBy('enrollments', 'DESC')
      .limit(10)
      .getRawMany();
    return rows.map((r) => ({
      name: r.name,
      category: r.category,
      enrollments: +r.enrollments,
      completed: +r.completed,
      avgScore: r.avgScore ? parseFloat(r.avgScore).toFixed(1) : 'N/A',
    }));
  }
}
