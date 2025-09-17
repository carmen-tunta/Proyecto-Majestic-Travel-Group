export default class GetContactsByClient {
  constructor(contactRepository) {
    this.contactRepository = contactRepository;
  }

  async execute(clientId) {
    return await this.contactRepository.getContactsByClient(clientId);
  }
}
