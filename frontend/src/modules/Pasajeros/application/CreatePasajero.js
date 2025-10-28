import Pasajero from '../domain/Pasajero.js';

export default class CreatePasajero {
  constructor(pasajeroRepository) {
    this.pasajeroRepository = pasajeroRepository;
  }

  async execute(pasajeroData) {
    // Validar datos del dominio
    const validationErrors = Pasajero.validate(pasajeroData);
    if (validationErrors.length > 0) {
      throw new Error(`Datos inválidos: ${validationErrors.join(', ')}`);
    }

    // Crear entidad de dominio
    const pasajero = new Pasajero(pasajeroData);

    // Llamar al repositorio
    const result = await this.pasajeroRepository.createPasajero({
      cotizacionId: pasajero.cotizacionId,
      nombre: pasajero.nombre,
      pais: pasajero.pais,
      whatsapp: pasajero.whatsapp,
      correo: pasajero.correo,
      fechaNacimiento: pasajero.fechaNacimiento,
      tipoDocumento: pasajero.tipoDocumento,
      numeroDocumento: pasajero.numeroDocumento,
      genero: pasajero.genero,
      nacionalidad: pasajero.nacionalidad,
      descripcionDocumento: pasajero.descripcionDocumento
    });

    return new Pasajero(result);
  }
}
