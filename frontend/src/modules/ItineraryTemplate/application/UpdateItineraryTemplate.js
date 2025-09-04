class UpdateItineraryTemplate {
    constructor(itineraryTemplateRepository) {
        this.itineraryTemplateRepository = itineraryTemplateRepository;
    }

    async execute(template) {
        return await this.itineraryTemplateRepository.updateTemplate(template);
    }
}
export default UpdateItineraryTemplate;