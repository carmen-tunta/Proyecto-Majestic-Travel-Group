class GetTarifaPriceByTarifaId {
    constructor(tarifaPriceRepository) {
        this.tarifaPriceRepository = tarifaPriceRepository;
    }

    async execute(tarifaId) {
        return await this.tarifaPriceRepository.getByTarifaId(tarifaId);
    }
}
export default GetTarifaPriceByTarifaId;