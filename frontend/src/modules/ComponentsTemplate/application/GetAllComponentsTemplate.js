import { ComponentsTemplateRepository } from '../repository/ComponentsTemplateRepository.js';

export class GetAllComponentsTemplate {
  constructor() {
    this.repository = new ComponentsTemplateRepository();
  }

  async execute(page = 0, limit = 10) {
    try {
      return await this.repository.getAll(page, limit);
    } catch (error) {
      console.error('Error en GetAllComponentsTemplate:', error);
      throw error;
    }
  }
}
