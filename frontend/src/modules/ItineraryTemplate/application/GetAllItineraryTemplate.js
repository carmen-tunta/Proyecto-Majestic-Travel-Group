class GetAllItineraryTemplate {
    constructor(itineraryTemplateRepository) {
        this.itineraryTemplateRepository = itineraryTemplateRepository;
    }

    async execute(limit) {
        return await this.itineraryTemplateRepository.getAllTemplates(limit);
    }
}

export default GetAllItineraryTemplate;