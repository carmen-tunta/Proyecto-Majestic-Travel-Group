import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProveedorContact } from './entities/proveedor-contact.entity';
import { ProveedorContactService } from './proveedor-contact.service';
import { ProveedorContactController } from './proveedor-contact.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProveedorContact])],
  controllers: [ProveedorContactController],
  providers: [ProveedorContactService],
})
export class ProveedorContactModule {}
