class UpdateTarifaColumn {
    constructor(tarifaColumnRepository) {
        this.tarifaColumnRepository = tarifaColumnRepository;
    }  
    async execute(column) {
        return await this.tarifaColumnRepository.update(column);
    }   

}
export default UpdateTarifaColumn;