import { ComponentsTemplateRepository } from '../repository/ComponentsTemplateRepository.js';

export class DeleteComponentsTemplate {
  constructor() {
    this.repository = new ComponentsTemplateRepository();
  }

  async execute(id, permanent = false) {
    try {
      // Validar que el ID existe
      if (!id) {
        throw new Error('ID es requerido para eliminar');
      }

      if (permanent) {
        return await this.repository.deletePermanent(id);
      } else {
        return await this.repository.delete(id);
      }
    } catch (error) {
      console.error('Error en DeleteComponentsTemplate:', error);
      throw error;
    }
  }
}
