import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TarifarioDocuments } from "./entities/tarifarioDocuments.entity";
import { TarifarioDocumentsService } from "./tarifarioDocuments.service";
import { TarifarioDocumentsController } from "./tarifarioDocuments.controller";

@Module({
    imports: [TypeOrmModule.forFeature([TarifarioDocuments])],
    controllers: [TarifarioDocumentsController],
    providers: [TarifarioDocumentsService],
})

export class TarifarioDocumentsModule {}