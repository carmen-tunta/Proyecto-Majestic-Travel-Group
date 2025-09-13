class CreateProveedorContact {
    constructor(proveedorContactRepository) {
        this.proveedorContactRepository = proveedorContactRepository;
    }

    async execute(contactData) {
        return this.proveedorContactRepository.create(contactData);
    }
}
export default CreateProveedorContact;