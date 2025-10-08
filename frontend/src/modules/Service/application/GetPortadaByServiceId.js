class GetPortadaByServiceId {
    constructor(repository) {
        this.repository = repository;
    }

    async execute(serviceId) {
        return await this.repository.getPortadaByServiceId(serviceId);
    }
}

export default GetPortadaByServiceId;