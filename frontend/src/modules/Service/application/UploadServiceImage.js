class UploadServiceImage {
    constructor(serviceImageRepository) {
        this.serviceImageRepository = serviceImageRepository;
    }

    async execute(data, file) {
        return this.serviceImageRepository.uploadImage(data, file);
    }
}

export default UploadServiceImage;