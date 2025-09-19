import { BadRequestException, Body, Controller, Delete, Get, Param, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { TarifarioDocumentsService } from "./tarifarioDocuments.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { File as MulterFile } from "multer";
import { TarifarioDocuments } from "./entities/tarifarioDocuments.entity";


@Controller('tarifario-documents') 
export class TarifarioDocumentsController {
    constructor(private readonly tdService: TarifarioDocumentsService) {}

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @Body() data: Partial<MulterFile>,
        @UploadedFile() file: MulterFile) 
    {
        return this.tdService.create(file, data);
    }

    @Delete(':id')
    async deleteFile(@Param('id') id: number) {
        return this.tdService.delete(id);
    }

    @Get(':id')
    async getFile(@Param('id') id: number) {
        return this.tdService.getById(id);
    }

    @Get('tarifario/:tarifarioId')
    async getFilesByTarifario(@Param('tarifarioId') tarifarioId: number) {
        return this.tdService.getByTarifarioId(tarifarioId);
    }

}