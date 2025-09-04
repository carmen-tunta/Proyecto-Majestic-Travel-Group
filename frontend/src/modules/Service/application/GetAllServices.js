class getAllServices {
    constructor(serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    async execute() {
        return await this.serviceRepository.getAllServices();
    }
}

export default getAllServices;