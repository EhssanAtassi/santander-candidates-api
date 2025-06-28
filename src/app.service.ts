import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to Santander Candidates API! Visit /api/docs for documentation.';
  }
}
