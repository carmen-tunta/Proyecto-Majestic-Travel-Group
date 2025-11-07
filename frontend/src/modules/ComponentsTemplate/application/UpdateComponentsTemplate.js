import { ComponentsTemplateRepository } from '../repository/ComponentsTemplateRepository.js';

export class UpdateComponentsTemplate {
  constructor() {
    this.repository = new ComponentsTemplateRepository();
  }

  async execute(id, componentData) {
    try {
      // Validar que el ID existe
      if (!id) {
        throw new Error('ID es requerido para actualizar');
      }

      return await this.repository.update(id, componentData);
    } catch (error) {
      console.error('Error en UpdateComponentsTemplate:', error);
      throw error;
    }
  }
}
