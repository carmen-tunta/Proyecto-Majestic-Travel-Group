class DeleteTarifaColumn {
    constructor(repo) {
        this.repo = repo;
    }

    async execute(id) {
        return await this.repo.delete(id);
    }
}

export default DeleteTarifaColumn;