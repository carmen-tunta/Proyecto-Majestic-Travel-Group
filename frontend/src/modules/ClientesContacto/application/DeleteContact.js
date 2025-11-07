export default class DeleteContact {
  constructor(contactRepository) {
    this.contactRepository = contactRepository;
  }

  async execute(contactId) {
    return await this.contactRepository.deleteContact(contactId);
  }
}
