class DeleteTarifaColumnByDescription {
    constructor(repo) {
        this.repo = repo;
    }

    async execute(id) {
        return await this.repo.delete(id);
    }
}

export default DeleteTarifaColumnByDescription;