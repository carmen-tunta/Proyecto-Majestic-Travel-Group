class GetAllServices {
    constructor(serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    async execute() {
        return await this.serviceRepository.getAllServices();
    }
}

export default GetAllServices;