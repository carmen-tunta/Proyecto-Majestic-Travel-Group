class DeleteComponentFromService {
    constructor(serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    async execute(serviceId, componentId) {
        await this.serviceRepository.deleteComponentFromService(serviceId, componentId);
    }
}
export default DeleteComponentFromService;