import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Trainings')
export class Training {
  @PrimaryGeneratedColumn()
  Id: number;

  @Column({ nullable: true })
  EmployeeId: number;

  @Column({ nullable: true })
  EmployeeName: string;

  @Column({ nullable: true })
  EmployeeEmail: string;

  @Column({ nullable: true })
  Leader: string;

  @Column({ nullable: true })
  ManagerName: string;

  @Column({ nullable: true })
  ManagerEmail: string;

  @Column({ nullable: true })
  BusinessUnit: string;

  @Column({ nullable: true })
  Country: string;

  @Column({ nullable: true })
  TrainingName: string;

  @Column({ nullable: true })
  TrainingCategory: string;

  @Column({ nullable: true })
  IsMandatory: boolean;

  @Column({ nullable: true })
  Status: string;

  @Column({ type: 'date', nullable: true })
  EnrollmentDate: Date;

  @Column({ type: 'date', nullable: true })
  DueDate: Date;

  @Column({ type: 'date', nullable: true })
  CompletionDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  TrainingHours: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  AssessmentScore: number;

  @Column({ nullable: true })
  TrainingProvider: string;

  @Column({ type: 'date', nullable: true })
  LoadDate: Date;
}
