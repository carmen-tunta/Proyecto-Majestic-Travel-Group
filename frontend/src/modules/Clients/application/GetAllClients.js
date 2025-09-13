class GetAllClients {
    constructor(clientRepository) {
        this.clientRepository = clientRepository;
    }

    async execute() {
        return await this.clientRepository.getAllClients();
    }
}

export default GetAllClients;
