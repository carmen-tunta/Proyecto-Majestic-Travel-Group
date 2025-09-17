class GetTarifaColumnByIdTarifa {
    constructor(tarifaColumnRepository) {
        this.tarifaColumnRepository = tarifaColumnRepository;
    }

    async execute(tarifaId) {
        return await this.tarifaColumnRepository.getTarifaColumnByIdTarifa(tarifaId);
    }

}
export default GetTarifaColumnByIdTarifa;