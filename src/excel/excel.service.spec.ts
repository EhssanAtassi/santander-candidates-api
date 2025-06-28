import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ExcelService } from './excel.service';
import * as XLSX from 'xlsx';

describe('ExcelService', () => {
  let service: ExcelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExcelService],
    }).compile();

    service = module.get<ExcelService>(ExcelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processExcelFile', () => {
    /**
     * Helper function to create Excel buffer from test data
     */
    const createExcelBuffer = (data: Record<string, unknown>[]): Buffer => {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
    };

    it('should process valid Excel data', () => {
      const testData = [{ seniority: 'junior', years: 5, availability: true }];
      const buffer = createExcelBuffer(testData);

      const result = service.processExcelFile(buffer);

      expect(result).toEqual({
        seniority: 'junior',
        years: 5,
        availability: true,
      });
    });

    it('should process valid Excel data with string boolean', () => {
      const testData = [{ seniority: 'senior', years: 10, availability: 'true' }];
      const buffer = createExcelBuffer(testData);

      const result = service.processExcelFile(buffer);

      expect(result).toEqual({
        seniority: 'senior',
        years: 10,
        availability: true,
      });
    });

    it('should process valid Excel data with case insensitive columns', () => {
      const testData = [{ SENIORITY: 'Junior', YEARS: 3, AVAILABILITY: 'false' }];
      const buffer = createExcelBuffer(testData);

      const result = service.processExcelFile(buffer);

      expect(result).toEqual({
        seniority: 'junior',
        years: 3,
        availability: false,
      });
    });

    it('should throw error for multiple rows', () => {
      const testData = [
        { seniority: 'junior', years: 5, availability: true },
        { seniority: 'senior', years: 10, availability: false },
      ];
      const buffer = createExcelBuffer(testData);

      expect(() => service.processExcelFile(buffer)).toThrow(BadRequestException);
      expect(() => service.processExcelFile(buffer)).toThrow(
        'Excel file must contain exactly one data row',
      );
    });

    it('should throw error for empty file', () => {
      const testData: Record<string, unknown>[] = [];
      const buffer = createExcelBuffer(testData);

      expect(() => service.processExcelFile(buffer)).toThrow(BadRequestException);
      expect(() => service.processExcelFile(buffer)).toThrow('Excel file must contain data rows');
    });

    it('should throw error for invalid seniority', () => {
      const testData = [{ seniority: 'invalid', years: 5, availability: true }];
      const buffer = createExcelBuffer(testData);

      expect(() => service.processExcelFile(buffer)).toThrow(BadRequestException);
      expect(() => service.processExcelFile(buffer)).toThrow(
        'Seniority must be either "junior" or "senior"',
      );
    });

    it('should throw error for missing seniority', () => {
      const testData = [{ years: 5, availability: true }];
      const buffer = createExcelBuffer(testData);

      expect(() => service.processExcelFile(buffer)).toThrow(BadRequestException);
      expect(() => service.processExcelFile(buffer)).toThrow('Missing required columns: seniority');
    });

    it('should throw error for invalid years', () => {
      const testData = [{ seniority: 'junior', years: -1, availability: true }];
      const buffer = createExcelBuffer(testData);

      expect(() => service.processExcelFile(buffer)).toThrow(BadRequestException);
      expect(() => service.processExcelFile(buffer)).toThrow(
        'Years must be a number between 0 and 50',
      );
    });

    it('should throw error for years too high', () => {
      const testData = [{ seniority: 'junior', years: 51, availability: true }];
      const buffer = createExcelBuffer(testData);

      expect(() => service.processExcelFile(buffer)).toThrow(BadRequestException);
      expect(() => service.processExcelFile(buffer)).toThrow(
        'Years must be a number between 0 and 50',
      );
    });

    it('should throw error for invalid availability', () => {
      const testData = [{ seniority: 'junior', years: 5, availability: 'maybe' }];
      const buffer = createExcelBuffer(testData);

      expect(() => service.processExcelFile(buffer)).toThrow(BadRequestException);
      expect(() => service.processExcelFile(buffer)).toThrow(
        'Availability must be a boolean value (true/false, 1/0, yes/no)',
      );
    });

    it('should handle different boolean formats', () => {
      const testCases = [
        { data: { seniority: 'junior', years: 5, availability: 1 }, expected: true },
        { data: { seniority: 'junior', years: 5, availability: 0 }, expected: false },
        { data: { seniority: 'junior', years: 5, availability: 'yes' }, expected: true },
        { data: { seniority: 'junior', years: 5, availability: 'no' }, expected: false },
        { data: { seniority: 'junior', years: 5, availability: 'TRUE' }, expected: true },
        { data: { seniority: 'junior', years: 5, availability: 'FALSE' }, expected: false },
      ];

      testCases.forEach(({ data, expected }) => {
        const buffer = createExcelBuffer([data]);
        const result = service.processExcelFile(buffer);
        expect(result.availability).toBe(expected);
      });
    });

    it('should handle decimal years by flooring them', () => {
      const testData = [{ seniority: 'junior', years: 5.7, availability: true }];
      const buffer = createExcelBuffer(testData);

      const result = service.processExcelFile(buffer);

      expect(result.years).toBe(5);
    });

    it('should handle corrupted or invalid Excel data', () => {
      // XLSX library is quite robust and often returns empty arrays for invalid data
      const corruptedBuffer = Buffer.from('not an excel file');

      expect(() => service.processExcelFile(corruptedBuffer)).toThrow(BadRequestException);
      expect(() => service.processExcelFile(corruptedBuffer)).toThrow(
        'Excel file must contain data rows',
      );
    });

    it('should throw error for Excel file with empty sheet', () => {
      // Create an Excel file with empty sheet
      const emptyWorkbook = XLSX.utils.book_new();
      const emptyWorksheet = XLSX.utils.aoa_to_sheet([]);
      XLSX.utils.book_append_sheet(emptyWorkbook, emptyWorksheet, 'EmptySheet');
      const buffer = XLSX.write(emptyWorkbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;

      expect(() => service.processExcelFile(buffer)).toThrow(BadRequestException);
      expect(() => service.processExcelFile(buffer)).toThrow('Excel file must contain data rows');
    });
  });
});
