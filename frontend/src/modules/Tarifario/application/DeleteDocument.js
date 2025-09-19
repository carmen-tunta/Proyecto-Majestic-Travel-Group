class DeleteDocument {
    constructor(tarifarioDocumentsRepository) {
        this.tarifarioDocumentsRepository = tarifarioDocumentsRepository;
    }

    async execute(id) {
        return this.tarifarioDocumentsRepository.deleteDocument(id);
    }
}

export default DeleteDocument;
