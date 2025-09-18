import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ServiceImage } from "./entities/serviceImages.entity";
import { ServiceImagesService } from "./serviceImages.service";
import { ServiceImagesController } from "./serviceImages.controller";

@Module({
    imports: [TypeOrmModule.forFeature([ServiceImage])],
    controllers: [ServiceImagesController],
    providers: [ServiceImagesService],
})

export class ServiceImagesModule {}