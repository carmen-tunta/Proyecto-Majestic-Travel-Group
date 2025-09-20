import Pasajero from '../domain/Pasajero.js';

export default class UpdatePasajeroWithFile {
  constructor(pasajeroRepository) {
    this.pasajeroRepository = pasajeroRepository;
  }

  async execute(pasajeroId, pasajeroData, file = null) {
    if (!pasajeroId) {
      throw new Error('El ID del pasajero es requerido');
    }

    // Validar datos básicos
    const validationData = { ...pasajeroData, cotizacionId: 1 }; // Temporal para validación
    const validationErrors = Pasajero.validate(validationData);
    if (validationErrors.length > 0) {
      throw new Error(`Datos inválidos: ${validationErrors.join(', ')}`);
    }

    // Validar archivo si se proporciona
    if (file) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Solo se permiten archivos PDF, JPG o PNG');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('El archivo no puede ser mayor a 5MB');
      }
    }

    // Crear FormData
    const formData = new FormData();
    formData.append('nombre', pasajeroData.nombre);
    formData.append('pais', pasajeroData.pais);
    formData.append('descripcionDocumento', pasajeroData.descripcionDocumento);
    
    if (file) {
      formData.append('file', file);
    }

    const result = await this.pasajeroRepository.updatePasajeroWithFile(pasajeroId, formData);

    return new Pasajero(result);
  }
}
