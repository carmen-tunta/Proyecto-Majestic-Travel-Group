class UpdateProveedorContact {
    constructor(proveedorContactRepository) {
        this.proveedorContactRepository = proveedorContactRepository;
    }

    async execute(contactData) {
        return this.proveedorContactRepository.update(contactData);
    }
}

export default UpdateProveedorContact;
