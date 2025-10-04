class uploadLeftDoble {
    constructor(servicePortadaRepository) {
        this.servicePortadaRepository = servicePortadaRepository;
    }  

    async execute(serviceId, file) {
        return await this.servicePortadaRepository.uploadLeftDoble(serviceId, file);
    }
}

export default uploadLeftDoble;