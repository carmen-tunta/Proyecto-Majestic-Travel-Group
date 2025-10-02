import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PermissionsService } from './permissions.service';

// Acciones estándar por módulo
const MODULES: Record<string, { label?: string; actions: [string, string, string?][]; description?: string }> = {
  COTIZACION: {
    label: 'Cotización',
    description: 'Operaciones sobre cotizaciones de viaje',
    actions: [
      ['VIEW', 'Ver cotizaciones'],
      ['CREATE', 'Crear cotización'],
      ['EDIT', 'Editar cotización'],
      ['DELETE', 'Eliminar cotización'],
      ['EXPORT', 'Exportar cotización'],
      ['ASSIGN', 'Asignar responsables'],
    ],
  },
  ITINERARIO: {
    label: 'Itinerario',
    actions: [
      ['VIEW', 'Ver itinerarios'],
      ['EDIT', 'Editar itinerario'],
      ['PUBLISH', 'Publicar itinerario'],
    ],
  },
  SERVICIOS: {
    label: 'Servicios',
    actions: [
      ['VIEW', 'Ver servicios'],
      ['CREATE', 'Crear servicio'],
      ['EDIT', 'Editar servicio'],
      ['DELETE', 'Eliminar servicio'],
    ],
  },
  USUARIOS: {
    label: 'Usuarios',
    actions: [
      ['VIEW', 'Ver usuarios'],
      ['CREATE', 'Crear usuario'],
      ['EDIT', 'Editar usuario'],
      ['SUSPEND', 'Suspender usuario'],
      ['RESET_PASSWORD', 'Resetear contraseña'],
    ],
  },
  COMPONENTES: {
    label: 'Componente',
    actions: [
      ['VIEW', 'Ver componentes'],
      ['CREATE', 'Crear nuevo componente'],
      ['EDIT', 'Editar componente'],
      ['DELETE', 'Eliminar componente']
    ]
  },
  CLIENTES: {
    label: 'Clientes',
    actions: [
      ['VIEW', 'Ver clientes'],
      ['CREATE', 'Crear cliente'],
      ['EDIT', 'Editar cliente'],
      ['DELETE', 'Eliminar cliente']
    ]
  },
  PLANTILLA_ITINERARIA: {
    label: 'Plantilla itineraria',
    actions: [
      ['VIEW', 'Ver plantillas'],
      ['CREATE', 'Crear plantilla itineraria'],
      ['EDIT', 'Editar plantilla itineraria'],
      ['DELETE', 'Eliminar plantilla itineraria']
    ]
  }
};

@Injectable()
export class PermissionsSeed implements OnModuleInit {
  private logger = new Logger(PermissionsSeed.name);
  constructor(private readonly permService: PermissionsService) {}

  async onModuleInit() {
    for (const code of Object.keys(MODULES)) {
      const def = MODULES[code];
      await this.permService.ensureModule(code, def.label || code, def.description);
      for (const [action, label, description] of def.actions) {
        await this.permService.ensureAction(code, action, label, description);
      }
    }
    this.logger.log('Permissions seed ensured');
  }
}
