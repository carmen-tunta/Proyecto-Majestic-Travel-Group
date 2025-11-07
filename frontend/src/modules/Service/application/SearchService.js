class SearchService {
    constructor(serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    async execute(name) {
        return await this.serviceRepository.searchServices(name);
    }
}

export default SearchService;