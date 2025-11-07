class GetPublicServices {
    constructor(serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    async execute(limit = 6) {
        return await this.serviceRepository.getPublicServices(limit);
    }
}

export default GetPublicServices;

