class SearchPublicService {
    constructor(serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    async execute(name) {
        return await this.serviceRepository.searchPublicServices(name);
    }
}

export default SearchPublicService;

