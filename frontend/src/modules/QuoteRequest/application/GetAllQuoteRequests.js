class GetAllQuoteRequests {
    constructor(repository) {
        this.repository = repository;
    }

    async execute(page = 0, limit = 15) {
        return await this.repository.getAllQuoteRequests(page, limit);
    }
}

export default GetAllQuoteRequests;
