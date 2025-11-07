export default class UpdateContact {
  constructor(contactRepository) {
    this.contactRepository = contactRepository;
  }

  async execute(contactId, contactData) {
    return await this.contactRepository.updateContact(contactId, contactData);
  }
}
