import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { QuoteRequestsService } from './quote-requests.service';
import { CreateQuoteRequestDto } from './dto/create-quote-request.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('quote-requests')
export class QuoteRequestsController {
  constructor(private readonly service: QuoteRequestsService) {}

  @Public()
  @Post()
  createFromPublic(@Body() dto: CreateQuoteRequestDto) {
    return this.service.createFromPublic(dto);
  }

  @Get()
  findAll(@Query('page') page = '0', @Query('limit') limit = '10') {
    const pageNum = parseInt(page || '0') || 0;
    const limitNum = parseInt(limit || '10') || 10;
    return this.service.findAll(pageNum, limitNum);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }
}


