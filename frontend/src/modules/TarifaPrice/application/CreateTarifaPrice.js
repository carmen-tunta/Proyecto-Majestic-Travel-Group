class CreateTarifaPrice {
    constructor(tarifaPriceRepository) {
        this.tarifaPriceRepository = tarifaPriceRepository;
    }

    async execute(priceData) {
        return await this.tarifaPriceRepository.create(priceData);
    }
}

export default CreateTarifaPrice;