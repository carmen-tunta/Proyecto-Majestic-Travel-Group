import Pasajero from '../domain/Pasajero.js';

export default class GetPasajeroById {
  constructor(pasajeroRepository) {
    this.pasajeroRepository = pasajeroRepository;
  }

  async execute(pasajeroId) {
    if (!pasajeroId) {
      throw new Error('El ID del pasajero es requerido');
    }

    const result = await this.pasajeroRepository.getPasajeroById(pasajeroId);
    
    return new Pasajero(result);
  }
}
