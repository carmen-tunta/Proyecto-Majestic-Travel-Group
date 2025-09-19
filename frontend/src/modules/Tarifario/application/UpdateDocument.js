class UpdateDocument {
    constructor(repo) {
        this.repo = repo
    }

    update(data) {
        return this.repo.update(data);
    }
}

export default UpdateDocument;