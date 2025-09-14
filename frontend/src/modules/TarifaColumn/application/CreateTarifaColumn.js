class CreateTarifaColumn {
    constructor(tarifaColumnRepository) {
        this.tarifaColumnRepository = tarifaColumnRepository;
    }

    async execute(data) {
        return await this.tarifaColumnRepository.create(data);
    }
}

export default CreateTarifaColumn;