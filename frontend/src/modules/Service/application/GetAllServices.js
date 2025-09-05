class getAllServices {
    constructor(serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    async execute(limit) {
        return await this.serviceRepository.getAllServices(limit);
    }
}

export default getAllServices;