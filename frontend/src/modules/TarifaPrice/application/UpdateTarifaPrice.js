class UpdateTarifaPrice {
    constructor(tarifaPriceRepository) {
        this.tarifaPriceRepository = tarifaPriceRepository;
    }

    async execute(id, priceData) {
        return await this.tarifaPriceRepository.update(id, priceData);
    }
}

export default UpdateTarifaPrice;
