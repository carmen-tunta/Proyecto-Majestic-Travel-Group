class GetTarifaComponentByIdTarifa {
    constructor(tarifaComponentRepository) {
        this.tarifaComponentRepository = tarifaComponentRepository;
    }

    async execute(tarifaId) {
        return await this.tarifaComponentRepository.getTarifaComponentByIdTarifa(tarifaId);
    }
}
export default GetTarifaComponentByIdTarifa;