class uploadRightDoble {
    constructor(servicePortadaRepository) {
        this.servicePortadaRepository = servicePortadaRepository;
    }

    async execute(serviceId, file) {
        return await this.servicePortadaRepository.uploadRightDoble(serviceId, file);
    }
}

export default uploadRightDoble;
