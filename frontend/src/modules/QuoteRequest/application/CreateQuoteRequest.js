class CreateQuoteRequest {
    constructor(repository) {
        this.repository = repository;
    }

    async execute(data) {
        return await this.repository.createQuoteRequest(data);
    }
}

export default CreateQuoteRequest;


