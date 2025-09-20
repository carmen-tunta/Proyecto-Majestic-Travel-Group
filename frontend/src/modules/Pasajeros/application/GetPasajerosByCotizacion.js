import Pasajero from '../domain/Pasajero.js';

export default class GetPasajerosByCotizacion {
  constructor(pasajeroRepository) {
    this.pasajeroRepository = pasajeroRepository;
  }

  async execute(cotizacionId) {
    if (!cotizacionId) {
      throw new Error('El ID de cotización es requerido');
    }

    const results = await this.pasajeroRepository.getPasajerosByCotizacion(cotizacionId);
    
    // Convertir cada resultado a entidad de dominio
    return results.map(pasajeroData => new Pasajero(pasajeroData));
  }
}
