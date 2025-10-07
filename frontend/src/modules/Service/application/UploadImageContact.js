class uploadImageContact {
    constructor(servicePortadaRepository) {
        this.servicePortadaRepository = servicePortadaRepository;
    }
    async execute(serviceId, file) {
        return await this.servicePortadaRepository.uploadImageContact(serviceId, file);
    }
}
export default uploadImageContact;