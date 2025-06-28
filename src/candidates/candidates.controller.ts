import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CandidatesService } from './candidates.service';
import { ExcelService } from '../excel/excel.service';
import {
  CandidateResponseDto,
  CreateCandidateDto,
  ExcelUploadDto,
  UpdateCandidateDto,
} from './dto';

@ApiTags('candidates')
@Controller('candidates')
export class CandidatesController {
  constructor(
    private readonly candidatesService: CandidatesService,
    private readonly excelService: ExcelService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new candidate' })
  @ApiResponse({
    status: 201,
    description: 'Candidate created successfully',
    type: CandidateResponseDto,
  })
  create(@Body() createCandidateDto: CreateCandidateDto) {
    return this.candidatesService.create(createCandidateDto);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, cb) => {
        // Only allow Excel files
        const allowedMimes = [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
        ];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only Excel files (.xlsx, .xls) are allowed'), false);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload candidate with Excel file',
    description:
      'Create a candidate by uploading name, surname and an Excel file containing seniority, years, and availability',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'John' },
        surname: { type: 'string', example: 'Doe' },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Excel file containing seniority, years, availability (only 1 row)',
        },
      },
      required: ['name', 'surname', 'file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Candidate created successfully from Excel upload',
    type: CandidateResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file format or Excel data validation error',
  })
  async uploadCandidate(
    @Body() uploadDto: ExcelUploadDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Excel file is required');
    }

    // Process Excel file to extract technical data
    const excelData = this.excelService.processExcelFile(file.buffer);

    // Combine form data with Excel data
    const candidateData: CreateCandidateDto = {
      name: uploadDto.name,
      surname: uploadDto.surname,
      seniority: excelData.seniority,
      years: excelData.years,
      availability: excelData.availability,
    };

    // Create and save candidate
    return this.candidatesService.create(candidateData);
  }

  @Get()
  @ApiOperation({ summary: 'Get all candidates' })
  @ApiResponse({
    status: 200,
    description: 'List of candidates',
    type: [CandidateResponseDto],
  })
  findAll() {
    return this.candidatesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get candidate by ID' })
  @ApiResponse({
    status: 200,
    description: 'Candidate details',
    type: CandidateResponseDto,
  })
  findOne(@Param('id') id: string) {
    return this.candidatesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update candidate' })
  @ApiResponse({
    status: 200,
    description: 'Candidate updated successfully',
    type: CandidateResponseDto,
  })
  update(@Param('id') id: string, @Body() updateCandidateDto: UpdateCandidateDto) {
    return this.candidatesService.update(id, updateCandidateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete candidate' })
  @ApiResponse({ status: 200, description: 'Candidate deleted successfully' })
  remove(@Param('id') id: string) {
    return this.candidatesService.remove(id);
  }
}
