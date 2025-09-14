class UpdateTarifaColumn {
    constructor(tarifaColumnRepository) {
        this.tarifaColumnRepository = tarifaColumnRepository;
    }  
    async execute(tc) {
        return await this.tarifaColumnRepository.update(tc);
    }   

}
export default UpdateTarifaColumn;