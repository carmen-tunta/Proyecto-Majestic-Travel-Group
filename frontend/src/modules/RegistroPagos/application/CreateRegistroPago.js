class CreateRegistroPago {
  constructor(registroPagoRepository) {
    this.registroPagoRepository = registroPagoRepository;
  }
    async execute(data) {
    return await this.registroPagoRepository.create(data);
  }
}

export default CreateRegistroPago;
