class GetItineraryTemplateById {
    constructor(itineraryTemplateRepository) {
        this.itineraryTemplateRepository = itineraryTemplateRepository;
    }

    async execute(id) {
        return await this.itineraryTemplateRepository.getTemplateById(id);
    }
}

export default GetItineraryTemplateById;