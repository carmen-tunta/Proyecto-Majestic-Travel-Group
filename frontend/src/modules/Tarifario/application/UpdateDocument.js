class UpdateDocument {
    constructor(repo) {
        this.repo = repo
    }

    execute(data, file) {
        return this.repo.update(data, file);
    }
}

export default UpdateDocument;