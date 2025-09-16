class FindPriceByComponentColumnId {
    constructor(tarifaPriceRepository) {
        this.tarifaPriceRepository = tarifaPriceRepository;
    }

    async execute(componentId, columnId) {
        return await this.tarifaPriceRepository.getByComponentColumnId(componentId, columnId);
    }
}

export default FindPriceByComponentColumnId;
