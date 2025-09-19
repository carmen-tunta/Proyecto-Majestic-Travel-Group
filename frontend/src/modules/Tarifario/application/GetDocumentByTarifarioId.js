class getDocumentByTarifarioId {
    constructor(tarifarioDocumentsRepository) {
        this.tarifarioDocumentsRepository = tarifarioDocumentsRepository;
    }

    async execute(tarifarioId) {
        return this.tarifarioDocumentsRepository.getDocumentByTarifarioId(tarifarioId);
    }
}

export default getDocumentByTarifarioId;