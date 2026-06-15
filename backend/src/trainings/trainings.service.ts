import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Training } from './training.entity';

@Injectable()
export class TrainingsService {
  constructor(
    @InjectRepository(Training)
    private readonly repo: Repository<Training>,
  ) {}

  async findAll(filters: {
    businessUnit?: string;
    country?: string;
    status?: string;
    category?: string;
    isMandatory?: string;
  }): Promise<Training[]> {
    const qb = this.repo.createQueryBuilder('t');

    if (filters.businessUnit) {
      qb.andWhere('t.BusinessUnit = :bu', { bu: filters.businessUnit });
    }
    if (filters.country) {
      qb.andWhere('t.Country = :country', { country: filters.country });
    }
    if (filters.status) {
      qb.andWhere('t.Status = :status', { status: filters.status });
    }
    if (filters.category) {
      qb.andWhere('t.TrainingCategory = :cat', { cat: filters.category });
    }
    if (filters.isMandatory !== undefined) {
      qb.andWhere('t.IsMandatory = :mandatory', {
        mandatory: filters.isMandatory === 'true' ? 1 : 0,
      });
    }

    return qb.getMany();
  }

  async getFilterOptions(): Promise<{
    businessUnits: string[];
    countries: string[];
    statuses: string[];
    categories: string[];
    providers: string[];
  }> {
    const [businessUnits, countries, statuses, categories, providers] =
      await Promise.all([
        this.repo
          .createQueryBuilder('t')
          .select('DISTINCT t.BusinessUnit', 'val')
          .where('t.BusinessUnit IS NOT NULL')
          .getRawMany(),
        this.repo
          .createQueryBuilder('t')
          .select('DISTINCT t.Country', 'val')
          .where('t.Country IS NOT NULL')
          .getRawMany(),
        this.repo
          .createQueryBuilder('t')
          .select('DISTINCT t.Status', 'val')
          .where('t.Status IS NOT NULL')
          .getRawMany(),
        this.repo
          .createQueryBuilder('t')
          .select('DISTINCT t.TrainingCategory', 'val')
          .where('t.TrainingCategory IS NOT NULL')
          .getRawMany(),
        this.repo
          .createQueryBuilder('t')
          .select('DISTINCT t.TrainingProvider', 'val')
          .where('t.TrainingProvider IS NOT NULL')
          .getRawMany(),
      ]);

    return {
      businessUnits: businessUnits.map((r) => r.val),
      countries: countries.map((r) => r.val),
      statuses: statuses.map((r) => r.val),
      categories: categories.map((r) => r.val),
      providers: providers.map((r) => r.val),
    };
  }
}
