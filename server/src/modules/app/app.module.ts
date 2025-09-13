import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from 'src/config/database.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { ItineraryTemplateModule } from '../itinerary-template/itinerary-template.module';
import { ComponentsModule } from '../components/components.module';
import { ServicesModule } from '../services/services.module';
import { ClientsModule } from '../clients/clients.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProveedoresModule } from '../proveedores/proveedores.module';
import { ProveedorContactModule } from '../proveedor-contact/proveedor-contact.module';
import { TarifarioModule } from '../tarifario/tarifario.module';

@Module({
  imports: [DatabaseModule, 
            UsersModule, 
            AuthModule, 
            ItineraryTemplateModule, 
            ComponentsModule, 
            ServicesModule, 
            ClientsModule,
            ProveedoresModule,
            ProveedorContactModule,
            TarifarioModule
          ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
