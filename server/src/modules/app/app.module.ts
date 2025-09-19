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
import { ContactClientsModule } from '../contact-clients/contact-clients.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProveedoresModule } from '../proveedores/proveedores.module';
import { ProveedorContactModule } from '../proveedor-contact/proveedor-contact.module';
import { TarifarioModule } from '../tarifario/tarifario.module';
import { TarifaComponentModule } from '../tarifaComponent/tarifaComponent.module';
import { TarifaColumnModule } from '../tarifaColumn/tarifaColumn.module';
import { TarifaPricesModule } from '../tarifaPrices/tarifaPrices.module';
import { TarifaIncrementModule } from '../tarifaIncrement/tarifaIncrement.module';
import { ServiceImagesModule } from '../serviceImages/serviceImages.module';
import { CotizacionModule } from '../cotizacion/cotizacion.module';

@Module({
 

  imports: [DatabaseModule, 
            UsersModule, 
            AuthModule, 
            ItineraryTemplateModule, 
            ComponentsModule, 
            ServicesModule, 
            ClientsModule,
            ContactClientsModule,
            ProveedoresModule,
            ProveedorContactModule,
            TarifarioModule,
            TarifaComponentModule,
            TarifaColumnModule,
            TarifaPricesModule,
            TarifaIncrementModule,
            ServiceImagesModule,
            CotizacionModule
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
