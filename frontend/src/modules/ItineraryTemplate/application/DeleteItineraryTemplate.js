class DeleteItineraryTemplate {
    constructor(itineraryTemplateRepository) {
        this.itineraryTemplateRepository = itineraryTemplateRepository;
    }

    async execute(id) {
        return await this.itineraryTemplateRepository.deleteTemplate(id);
    }
}

export default DeleteItineraryTemplate;
