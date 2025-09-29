class GetAllRegistroPago {
  constructor({ registroPagoRepository }) {
    this.registroPagoRepository = registroPagoRepository;
  }

  async execute() {
    return await this.registroPagoRepository.getAll();
  }
}

export default GetAllRegistroPago;