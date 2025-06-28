import { ApiProperty } from '@nestjs/swagger';

export class CandidateResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the candidate',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'First name of the candidate',
    example: 'John',
  })
  name: string;

  @ApiProperty({
    description: 'Last name of the candidate',
    example: 'Doe',
  })
  surname: string;

  @ApiProperty({
    description: 'Experience level of the candidate',
    example: 'junior',
    enum: ['junior', 'senior'],
  })
  seniority: 'junior' | 'senior';

  @ApiProperty({
    description: 'Years of professional experience',
    example: 5,
  })
  years: number;

  @ApiProperty({
    description: 'Whether the candidate is currently available',
    example: true,
  })
  availability: boolean;

  @ApiProperty({
    description: 'Timestamp when the candidate record was created',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the candidate record was last updated',
    example: '2024-01-15T14:45:00.000Z',
  })
  updatedAt: Date;
}
