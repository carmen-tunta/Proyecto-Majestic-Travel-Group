class DeleteProveedorContact {
  constructor(proveedorContactRepository) {
    this.proveedorContactRepository = proveedorContactRepository;
  } 
    async execute(id) {
        return await this.proveedorContactRepository.delete(id);
    }
}

export default DeleteProveedorContact;