class DeleteTarifaPrice {
    constructor(tarifaPriceRepository) {
        this.tarifaPriceRepository = tarifaPriceRepository;
    }

    async execute(id) {
        return await this.tarifaPriceRepository.delete(id);
    }
}

export default DeleteTarifaPrice;
