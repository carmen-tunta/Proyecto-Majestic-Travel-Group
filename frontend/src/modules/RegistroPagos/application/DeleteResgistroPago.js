class DeleteRegistroPago {
    constructor(registroPagoRepository) {
        this.registroPagoRepository = registroPagoRepository;
    }

    async execute(id) {
        return await this.registroPagoRepository.delete(id);
    }
}

export default DeleteRegistroPago;