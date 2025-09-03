class UpdateItineraryTemplate {
    constructor(itineraryTemplateRepository) {
        this.itineraryTemplateRepository = itineraryTemplateRepository;
    }

    async execute(id, template) {
        return await this.itineraryTemplateRepository.updateTemplate(id, template);
    }
}
export default UpdateItineraryTemplate;