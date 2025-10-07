class UploadLeftImage {
    constructor(repository) {
        this.repository = repository;
    }

    async execute(serviceId, file) {
        if (!serviceId || !file) {
            throw new Error('Faltan parámetros requeridos');
        }
        return await this.repository.uploadLeftImage(serviceId, file);
    }
}

export default UploadLeftImage;