import { ComponentsTemplateRepository } from '../repository/ComponentsTemplateRepository.js';

export class GetComponentsTemplateById {
  constructor() {
    this.repository = new ComponentsTemplateRepository();
  }

  async execute(id) {
    try {
      return await this.repository.getById(id);
    } catch (error) {
      console.error('Error en GetComponentsTemplateById:', error);
      throw error;
    }
  }
}
