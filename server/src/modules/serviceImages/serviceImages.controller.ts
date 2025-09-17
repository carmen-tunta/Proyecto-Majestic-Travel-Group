import { Body, Controller, Delete, Get, Param, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ServiceImagesService } from "./serviceImages.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { File as MulterFile } from "multer";

@Controller('service-images') 
export class ServiceImagesController {
    constructor(private readonly serviceImagesService: ServiceImagesService) {}

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @Body() data: Partial<MulterFile>,
        @UploadedFile() file: MulterFile) 
    {
        return this.serviceImagesService.create(file, data);
    }

    @Delete(':id')
    async deleteFile(@Param('id') id: number) {
        return this.serviceImagesService.delete(id);
    }

    @Get(':id')
    async getFile(@Param('id') id: number) {
        return this.serviceImagesService.getById(id);
    }
    
}