export default class GetAllContacts {
  constructor(contactRepository) {
    this.contactRepository = contactRepository;
  }

  async execute() {
    return await this.contactRepository.getAllContacts();
  }
}
