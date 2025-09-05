class UpdateService {
    constructor(serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    async execute(serviceData) {
        return await this.serviceRepository.updateService(serviceData);
    }
}

export default UpdateService;