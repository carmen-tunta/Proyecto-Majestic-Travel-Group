class DeleteTarifaComponent {
    constructor(tcRepo) {
        this.tcRepo = tcRepo;
    }

    async execute(tId, cId) {
        return await this.tcRepo.delete(tId, cId);
    }
}

export default DeleteTarifaComponent;
