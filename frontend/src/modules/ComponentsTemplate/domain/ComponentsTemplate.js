export class ComponentsTemplate {
  constructor(id, componentName, serviceType, description, createdAt, updatedAt, isActive) {
    this.id = id;
    this.componentName = componentName;
    this.serviceType = serviceType;
    this.description = description;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.isActive = isActive;
  }

  // Métodos de validación
  isValid() {
    return this.componentName && this.serviceType;
  }

  // Métodos de transformación
  toJSON() {
    return {
      id: this.id,
      componentName: this.componentName,
      serviceType: this.serviceType,
      description: this.description,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isActive: this.isActive
    };
  }

  static fromJSON(data) {
    return new ComponentsTemplate(
      data.id,
      data.componentName,
      data.serviceType,
      data.description,
      data.createdAt,
      data.updatedAt,
      data.isActive
    );
  }
}
