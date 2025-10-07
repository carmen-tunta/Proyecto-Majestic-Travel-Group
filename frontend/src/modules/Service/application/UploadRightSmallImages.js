class UploadRightSmallImage {
    constructor(repo) {
        this.repo = repo;
    }
    async execute(serviceId, file) {
        if (!serviceId || !file) {
            throw new Error('Faltan parámetros requeridos');
        }
        return await this.repo.uploadRightSmallImage(serviceId, file);
    }
}

export default UploadRightSmallImage;