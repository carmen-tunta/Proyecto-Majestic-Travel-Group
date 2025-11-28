class GetAllItineraryTemplate {
    constructor(itineraryTemplateRepository) {
        this.itineraryTemplateRepository = itineraryTemplateRepository;
    }

    async execute(page = 0, limit = 15) {
        return await this.itineraryTemplateRepository.getAllTemplates(page, limit);
    }
}

export default GetAllItineraryTemplate;