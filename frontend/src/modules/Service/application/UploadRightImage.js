class UploadRightImage {
    constructor(repo) { 
        this.repo = repo;
    }
    async execute(serviceId, file) {
        if (!serviceId || !file) {
            throw new Error('Faltan parámetros requeridos');
        }
        return await this.repo.uploadRightImage(serviceId, file);
    }
}

export default UploadRightImage;