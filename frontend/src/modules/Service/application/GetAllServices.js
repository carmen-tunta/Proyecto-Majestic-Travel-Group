class GetAllServices {
    constructor(serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    async execute(params = { page: 0, limit: 6 }) {
        return await this.serviceRepository.getAllServices(params);
    }
}

export default GetAllServices;