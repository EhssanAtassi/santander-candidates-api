import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CandidatesController } from './candidates.controller';
import { CandidatesService } from './candidates.service';
import { ExcelService } from '../excel/excel.service';
import * as XLSX from 'xlsx';

describe('CandidatesController', () => {
  let controller: CandidatesController;
  let candidatesService: jest.Mocked<CandidatesService>;
  let excelService: jest.Mocked<ExcelService>;

  // Mock data
  const mockCandidate = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'John',
    surname: 'Doe',
    seniority: 'junior' as const,
    years: 5,
    availability: true,
    createdAt: new Date('2024-01-15T10:30:00.000Z'),
    updatedAt: new Date('2024-01-15T10:30:00.000Z'),
  };

  beforeEach(async () => {
    // Create fresh mocks for each test
    const mockCandidatesService = {
      create: jest.fn().mockResolvedValue(mockCandidate),
      findAll: jest.fn().mockResolvedValue([mockCandidate]),
      findOne: jest.fn().mockResolvedValue(mockCandidate),
      update: jest.fn().mockResolvedValue(mockCandidate),
      remove: jest.fn().mockResolvedValue(undefined),
    };

    const mockExcelService = {
      processExcelFile: jest.fn().mockReturnValue({
        seniority: 'junior',
        years: 5,
        availability: true,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CandidatesController],
      providers: [
        {
          provide: CandidatesService,
          useValue: mockCandidatesService,
        },
        {
          provide: ExcelService,
          useValue: mockExcelService,
        },
      ],
    }).compile();

    controller = module.get<CandidatesController>(CandidatesController);
    candidatesService = module.get(CandidatesService);
    excelService = module.get(ExcelService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a candidate', async () => {
      const createDto = {
        name: 'John',
        surname: 'Doe',
        seniority: 'junior' as const,
        years: 5,
        availability: true,
      };

      const result = await controller.create(createDto);

      expect(candidatesService.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockCandidate);
    });
  });

  describe('uploadCandidate', () => {
    const uploadDto = {
      name: 'John',
      surname: 'Doe',
    };

    const createExcelBuffer = (data: Record<string, unknown>[]): Buffer => {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
    };

    const createMockFile = (): Express.Multer.File => ({
      fieldname: 'file',
      originalname: 'test.xlsx',
      encoding: '7bit',
      mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer: createExcelBuffer([{ seniority: 'junior', years: 5, availability: true }]),
      size: 1024,
      destination: '',
      filename: '',
      path: '',
      stream: null as any,
    });

    it('should upload and create candidate successfully', async () => {
      const mockFile = createMockFile();
      const result = await controller.uploadCandidate(uploadDto, mockFile);

      expect(excelService.processExcelFile).toHaveBeenCalledWith(mockFile.buffer);
      expect(candidatesService.create).toHaveBeenCalledWith({
        name: 'John',
        surname: 'Doe',
        seniority: 'junior',
        years: 5,
        availability: true,
      });
      expect(result).toEqual(mockCandidate);
    });

    it('should throw error when no file provided', async () => {
      await expect(controller.uploadCandidate(uploadDto, undefined as any)).rejects.toThrow(
        BadRequestException,
      );

      await expect(controller.uploadCandidate(uploadDto, undefined as any)).rejects.toThrow(
        'Excel file is required',
      );
    });

    it('should handle Excel processing errors', async () => {
      const mockFile = createMockFile();

      // Reset the mock and set it to throw an error
      excelService.processExcelFile.mockReset();
      excelService.processExcelFile.mockImplementation(() => {
        throw new BadRequestException('Invalid Excel format');
      });

      // Test that the error is properly thrown
      await expect(controller.uploadCandidate(uploadDto, mockFile)).rejects.toThrow(
        BadRequestException,
      );

      await expect(controller.uploadCandidate(uploadDto, mockFile)).rejects.toThrow(
        'Invalid Excel format',
      );

      // Verify the service was called
      expect(excelService.processExcelFile).toHaveBeenCalledWith(mockFile.buffer);
    });

    it('should handle candidates service errors', async () => {
      const mockFile = createMockFile();

      // Mock candidates service to throw error
      candidatesService.create.mockReset();
      candidatesService.create.mockRejectedValue(new BadRequestException('Database error'));

      await expect(controller.uploadCandidate(uploadDto, mockFile)).rejects.toThrow(
        BadRequestException,
      );

      await expect(controller.uploadCandidate(uploadDto, mockFile)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('findAll', () => {
    it('should return array of candidates', async () => {
      const result = await controller.findAll();

      expect(candidatesService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([mockCandidate]);
    });
  });

  describe('findOne', () => {
    it('should return a candidate by id', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const result = await controller.findOne(id);

      expect(candidatesService.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockCandidate);
    });
  });

  describe('update', () => {
    it('should update a candidate', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const updateDto = { name: 'Jane' };

      const result = await controller.update(id, updateDto);

      expect(candidatesService.update).toHaveBeenCalledWith(id, updateDto);
      expect(result).toEqual(mockCandidate);
    });
  });

  describe('remove', () => {
    it('should remove a candidate', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';

      await controller.remove(id);

      expect(candidatesService.remove).toHaveBeenCalledWith(id);
      expect(candidatesService.remove).toHaveBeenCalledTimes(1);
    });
  });
});
