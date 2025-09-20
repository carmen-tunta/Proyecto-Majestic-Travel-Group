import Pasajero from '../domain/Pasajero.js';

export default class CreatePasajeroWithFile {
  constructor(pasajeroRepository) {
    this.pasajeroRepository = pasajeroRepository;
  }

  async execute(pasajeroData, file) {
    // Validar datos básicos
    const validationErrors = Pasajero.validate(pasajeroData);
    if (validationErrors.length > 0) {
      throw new Error(`Datos inválidos: ${validationErrors.join(', ')}`);
    }

    // Validar archivo
    if (!file) {
      throw new Error('El archivo es requerido');
    }

    // Validar tipo de archivo
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Solo se permiten archivos PDF, JPG o PNG');
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('El archivo no puede ser mayor a 5MB');
    }

    // Crear FormData
    const formData = new FormData();
    formData.append('cotizacionId', pasajeroData.cotizacionId);
    formData.append('nombre', pasajeroData.nombre);
    formData.append('pais', pasajeroData.pais);
    formData.append('descripcionDocumento', pasajeroData.descripcionDocumento);
    formData.append('file', file);

    // Llamar al repositorio
    const result = await this.pasajeroRepository.createPasajeroWithFile(formData);

    return new Pasajero(result);
  }
}
