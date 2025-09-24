export default class Pasajero {
  constructor({
    id,
    cotizacionId,
    nombre,
    pais,
    descripcionDocumento,
    rutaArchivo,
    nombreArchivo,
    createdAt,
    updatedAt
  }) {
    this.id = id;
    this.cotizacionId = cotizacionId;
    this.nombre = nombre;
    this.pais = pais;
    this.descripcionDocumento = descripcionDocumento;
    this.rutaArchivo = rutaArchivo;
    this.nombreArchivo = nombreArchivo;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Validaciones del dominio
  static validate( PasajeroData) {
    const errors = [];

    if (!PasajeroData.nombre?.trim()) {
      errors.push('El nombre es requerido');
    }

    if (!PasajeroData.pais?.trim()) {
      errors.push('El país es requerido');
    }

    if (!PasajeroData.descripcionDocumento?.trim()) {
      errors.push('La descripción del documento es requerida');
    }

    if (!PasajeroData.cotizacionId) {
      errors.push('El ID de cotización es requerido');
    }

    return errors;
  }

  // Métodos de negocio
  hasDocument() {
    return !!(this.rutaArchivo && this.nombreArchivo);
  }

  getDocumentExtension() {
    if (!this.nombreArchivo) return null;
    return this.nombreArchivo.split('.').pop().toLowerCase();
  }

  isDocumentType(type) {
    const extension = this.getDocumentExtension();
    const validTypes = {
      pdf: ['pdf'],
      image: ['jpg', 'jpeg', 'png'],
      document: ['pdf', 'doc', 'docx']
    };
    return validTypes[type]?.includes(extension) || false;
  }
}
