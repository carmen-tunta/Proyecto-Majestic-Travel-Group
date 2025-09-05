class CreateService {
    constructor(serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    async execute(serviceData) {
        return await this.serviceRepository.createService(serviceData);
    }
}

export default CreateService;