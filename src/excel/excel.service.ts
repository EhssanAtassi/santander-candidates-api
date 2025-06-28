import { BadRequestException, Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';

export interface ExcelData {
  seniority: 'junior' | 'senior';
  years: number;
  availability: boolean;
}

interface ExcelRow {
  [key: string]: unknown;
}

interface NormalizedExcelRow {
  seniority?: unknown;
  years?: unknown;
  availability?: unknown;
}

@Injectable()
export class ExcelService {
  /**
   * Process uploaded Excel file and extract candidate technical data
   * Expected columns: seniority, years, availability (only 1 row)
   */
  processExcelFile(buffer: Buffer): ExcelData {
    try {
      // Parse Excel file
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];

      if (!sheetName) {
        throw new BadRequestException('Excel file must contain at least one sheet');
      }

      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Validate exactly one row requirement
      if (jsonData.length === 0) {
        throw new BadRequestException('Excel file must contain data rows');
      }

      if (jsonData.length > 1) {
        throw new BadRequestException('Excel file must contain exactly one data row');
      }

      const row = jsonData[0];

      // Type guard to ensure row is an object
      if (!this.isValidExcelRow(row)) {
        throw new BadRequestException('Invalid Excel row format');
      }

      // Validate required columns exist
      const requiredColumns = ['seniority', 'years', 'availability'];
      const normalizedRow = this.normalizeKeys(row);
      const missingColumns = requiredColumns.filter(col => !(col in normalizedRow));

      if (missingColumns.length > 0) {
        throw new BadRequestException(`Missing required columns: ${missingColumns.join(', ')}`);
      }

      // Extract and validate data
      return {
        seniority: this.validateSeniority(normalizedRow.seniority),
        years: this.validateYears(normalizedRow.years),
        availability: this.validateAvailability(normalizedRow.availability),
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Failed to process Excel file: ${errorMessage}`);
    }
  }

  /**
   * Type guard to check if value is a valid Excel row
   */
  private isValidExcelRow(value: unknown): value is ExcelRow {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  /**
   * Type guard to check if value can be converted to string safely
   */
  private isStringifiable(value: unknown): value is string | number | boolean {
    return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
  }

  /**
   * Normalize object keys to lowercase for case-insensitive comparison
   */
  private normalizeKeys(obj: ExcelRow): NormalizedExcelRow {
    const normalized: NormalizedExcelRow = {};

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const normalizedKey = key.toLowerCase();
        if (
          normalizedKey === 'seniority' ||
          normalizedKey === 'years' ||
          normalizedKey === 'availability'
        ) {
          normalized[normalizedKey as keyof NormalizedExcelRow] = obj[key];
        }
      }
    }

    return normalized;
  }

  /**
   * Validate seniority value
   */
  private validateSeniority(value: unknown): 'junior' | 'senior' {
    if (!value) {
      throw new BadRequestException('Seniority is required');
    }

    if (!this.isStringifiable(value)) {
      throw new BadRequestException('Seniority must be a valid text value');
    }

    const seniority = String(value).toLowerCase().trim();
    if (seniority !== 'junior' && seniority !== 'senior') {
      throw new BadRequestException('Seniority must be either "junior" or "senior"');
    }
    return seniority;
  }

  /**
   * Validate years value
   */
  private validateYears(value: unknown): number {
    if (value === null || value === undefined || value === '') {
      throw new BadRequestException('Years is required');
    }

    if (!this.isStringifiable(value)) {
      throw new BadRequestException('Years must be a valid number');
    }

    const years = Number(value);
    if (isNaN(years) || years < 0 || years > 50) {
      throw new BadRequestException('Years must be a number between 0 and 50');
    }
    return Math.floor(years); // Ensure integer
  }

  /**
   * Validate availability value
   */
  private validateAvailability(value: unknown): boolean {
    if (value === null || value === undefined || value === '') {
      throw new BadRequestException('Availability is required');
    }

    if (typeof value === 'boolean') {
      return value;
    }

    if (!this.isStringifiable(value)) {
      throw new BadRequestException('Availability must be a valid boolean value');
    }

    const strValue = String(value).toLowerCase().trim();
    if (strValue === 'true' || strValue === '1' || strValue === 'yes') {
      return true;
    }
    if (strValue === 'false' || strValue === '0' || strValue === 'no') {
      return false;
    }

    throw new BadRequestException('Availability must be a boolean value (true/false, 1/0, yes/no)');
  }
}
