class DeleteTarifaColumnByDescription {
    constructor(repo) {
        this.repo = repo;
    }

    async execute(tarifaId, description, paxMin, paxMax) {
        return await this.repo.deleteByDescription(tarifaId, description, paxMin, paxMax);
    }
}

export default DeleteTarifaColumnByDescription;