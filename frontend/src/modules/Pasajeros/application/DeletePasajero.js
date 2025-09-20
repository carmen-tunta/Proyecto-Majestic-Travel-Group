export default class DeletePasajero {
  constructor(pasajeroRepository) {
    this.pasajeroRepository = pasajeroRepository;
  }

  async execute(pasajeroId, hasFile = false) {
    if (!pasajeroId) {
      throw new Error('El ID del pasajero es requerido');
    }

    if (hasFile) {
      return await this.pasajeroRepository.deletePasajeroWithFile(pasajeroId);
    } else {
      return await this.pasajeroRepository.deletePasajero(pasajeroId);
    }
  }
}
