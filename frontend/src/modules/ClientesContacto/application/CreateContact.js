export default class CreateContact {
  constructor(contactRepository) {
    this.contactRepository = contactRepository;
  }

  async execute(contactData) {
    return await this.contactRepository.createContact(contactData);
  }
}
