class UploadLeftSmallImage {
    constructor(repository) {
        this.repository = repository;
    }

    async execute(serviceId, file) {
        if (!serviceId || !file) {
            throw new Error('Faltan parámetros requeridos');
        }
        return await this.repository.uploadLeftSmallImage(serviceId, file);
    }
}

export default UploadLeftSmallImage;