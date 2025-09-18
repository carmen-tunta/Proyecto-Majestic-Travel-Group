class DeleteImageFromService {
    constructor(repo) {
        this.repo = repo;
    }

    async execute(imageId) {
        return this.repo.deleteImage(imageId);
    }
}

export default DeleteImageFromService;  