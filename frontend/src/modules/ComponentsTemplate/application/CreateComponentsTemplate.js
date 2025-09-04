import { ComponentsTemplateRepository } from '../repository/ComponentsTemplateRepository.js';

export class CreateComponentsTemplate {
  constructor() {
    this.repository = new ComponentsTemplateRepository();
  }

  async execute(componentData) {
    try {
      // Validar datos requeridos
      if (!componentData.componentName || !componentData.serviceType) {
        throw new Error('componentName y serviceType son requeridos');
      }

      return await this.repository.create(componentData);
    } catch (error) {
      console.error('Error en CreateComponentsTemplate:', error);
      throw error;
    }
  }
}
