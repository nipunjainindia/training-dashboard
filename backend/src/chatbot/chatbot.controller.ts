import { Body, Controller, Post, HttpException, HttpStatus } from '@nestjs/common';
import { IsString, IsNotEmpty } from 'class-validator';
import { ChatbotService } from './chatbot.service';

class ChatQueryDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;
}

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly svc: ChatbotService) {}

  @Post('query')
  async query(@Body() body: ChatQueryDto) {
    try {
      return await this.svc.query(body.prompt);
    } catch (error) {
      throw new HttpException(
        { message: error.message || 'Failed to process query', error: true },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
