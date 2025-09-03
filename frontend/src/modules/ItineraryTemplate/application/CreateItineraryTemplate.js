class CreateItineraryTemplate {
    constructor(itineraryTemplateRepository) {
        this.itineraryTemplateRepository = itineraryTemplateRepository;
    }

    async execute(template) {
        return await this.itineraryTemplateRepository.createTemplate(template);
    }
}

export default CreateItineraryTemplate; 