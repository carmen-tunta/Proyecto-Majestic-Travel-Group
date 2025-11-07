import Pasajero from '../domain/Pasajero.js';

export default class UpdatePasajero {
  constructor(pasajeroRepository) {
    this.pasajeroRepository = pasajeroRepository;
  }

  async execute(pasajeroId, pasajeroData) {
    if (!pasajeroId) {
      throw new Error('El ID del pasajero es requerido');
    }

    // Validar datos del dominio (sin cotizacionId para actualización)
    const validationData = { ...pasajeroData, cotizacionId: 1 }; // Temporal para validación
    const validationErrors = Pasajero.validate(validationData);
    if (validationErrors.length > 0) {
      throw new Error(`Datos inválidos: ${validationErrors.join(', ')}`);
    }

    const result = await this.pasajeroRepository.updatePasajero(pasajeroId, {
      nombre: pasajeroData.nombre,
      pais: pasajeroData.pais,
      whatsapp: pasajeroData.whatsapp,
      correo: pasajeroData.correo,
      fechaNacimiento: pasajeroData.fechaNacimiento,
      tipoDocumento: pasajeroData.tipoDocumento,
      numeroDocumento: pasajeroData.numeroDocumento,
      genero: pasajeroData.genero,
      nacionalidad: pasajeroData.nacionalidad,
      descripcionDocumento: pasajeroData.descripcionDocumento
    });

    return new Pasajero(result);
  }
}
