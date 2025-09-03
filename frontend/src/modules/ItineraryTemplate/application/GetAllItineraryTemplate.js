class GetAllItineraryTemplate {
    constructor(itineraryTemplateRepository) {
        this.itineraryTemplateRepository = itineraryTemplateRepository;
    }

    async execute() {
        return await this.itineraryTemplateRepository.getAllTemplates();
    }
}

export default GetAllItineraryTemplate;