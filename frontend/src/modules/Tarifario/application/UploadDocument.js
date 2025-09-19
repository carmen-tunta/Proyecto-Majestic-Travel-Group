class UploadDocument {
    constructor(repo) {
        this.repo = repo
    }

    execute(data, file) {
        return this.repo.save(data, file);
    }
}

export default UploadDocument;