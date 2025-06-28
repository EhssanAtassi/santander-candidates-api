import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Here is the :
 * Candidate Entity - Represents a job candidate in the database
 * Combines basic info (name, surname) with Excel data (seniority, years, availability)
 */
@Entity('candidates')
export class Candidate {
  @ApiProperty({
    description: 'Unique identifier for the candidate',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'First name of the candidate',
    example: 'John',
    maxLength: 100,
  })
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ApiProperty({
    description: 'Last name of the candidate',
    example: 'Doe',
    maxLength: 100,
  })
  @Column({ type: 'varchar', length: 100 })
  surname: string;

  @ApiProperty({
    description: 'Experience level of the candidate',
    example: 'junior',
    enum: ['junior', 'senior'],
  })
  @Column({ type: 'varchar', length: 10 })
  seniority: 'junior' | 'senior';

  @ApiProperty({
    description: 'Years of professional experience',
    example: 5,
    minimum: 0,
    maximum: 50,
  })
  @Column({ type: 'integer' })
  years: number;

  @ApiProperty({
    description: 'Whether the candidate is currently available',
    example: true,
  })
  @Column({ type: 'boolean' })
  availability: boolean;

  @ApiProperty({
    description: 'Timestamp when the candidate record was created',
    example: '2024-01-15T10:30:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the candidate record was last updated',
    example: '2024-01-15T14:45:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
