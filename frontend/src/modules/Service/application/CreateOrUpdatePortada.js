class CreateOrUpdatePortada {
    constructor(repository) {
        this.repository = repository;
    }

    async execute(serviceId, data, file) {
        return await this.repository.createOrUpdatePortada(serviceId, data, file);
    }
}

export default CreateOrUpdatePortada;