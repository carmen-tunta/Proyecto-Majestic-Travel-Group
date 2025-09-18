class GetServiceImagesByServiceId {
    constructor(serviceImageRepository) {
        this.serviceImageRepository = serviceImageRepository;
    }

    async execute(serviceId) {
        return this.serviceImageRepository.getImagesByServiceId(serviceId);
    }
}

export default GetServiceImagesByServiceId;
