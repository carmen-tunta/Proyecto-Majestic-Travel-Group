class updateByDescription {
    constructor(tarifaColumnRepository) {
        this.tarifaColumnRepository = tarifaColumnRepository;
    }
    async execute(tarifaId, oldDescription, oldPaxMin, oldPaxMax, newDescription, newPaxMin, newPaxMax) {
        return await this.tarifaColumnRepository.updateByDescription(tarifaId, oldDescription, oldPaxMin, oldPaxMax, newDescription, newPaxMin, newPaxMax);
    }

}
export default updateByDescription;