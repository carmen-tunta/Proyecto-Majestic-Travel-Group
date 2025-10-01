import { Body, Controller, Get, Param, Post, Put, Query, Patch } from '@nestjs/common';
import { QuoteRequestsService } from './quote-requests.service';
import { AssignmentService } from './services/assignment.service';
import { CreateQuoteRequestDto } from './dto/create-quote-request.dto';
import { UpdateQuoteRequestDto } from './dto/update-quote-request.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('quote-requests')
export class QuoteRequestsController {
  constructor(
    private readonly service: QuoteRequestsService,
    private readonly assignmentService: AssignmentService
  ) {}

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

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateQuoteRequestDto) {
    return this.service.update(Number(id), dto);
  }

  // ===== ENDPOINTS DE ASIGNACIÓN =====

  @Post(':id/assign')
  assignToAgent(@Param('id') id: string) {
    return this.assignmentService.assignRequestToAgent(Number(id));
  }

  @Patch(':id/release')
  releaseRequest(@Param('id') id: string, @Body() body: { agentId: number }) {
    return this.assignmentService.releaseRequest(Number(id), body.agentId);
  }

  @Patch(':id/take')
  takeRequest(@Param('id') id: string, @Body() body: { agentId: number }) {
    return this.assignmentService.takeRequest(Number(id), body.agentId);
  }

  @Patch(':id/cotizando')
  markAsQuoting(@Param('id') id: string, @Body() body: { agentId: number }) {
    return this.assignmentService.markAsQuoting(Number(id), body.agentId);
  }

  @Patch(':id/sin-respuesta')
  markAsNoResponse(@Param('id') id: string, @Body() body: { agentId: number }) {
    return this.assignmentService.markAsNoResponse(Number(id), body.agentId);
  }

  @Get('agents/assignment-status')
  getAgentsAssignmentStatus() {
    return this.assignmentService.getAgentsAssignmentStatus();
  }
}


