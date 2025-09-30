class GetRegistroPagoByCotizacionId {
    constructor(registroPagoRepository) {
        this.registroPagoRepository = registroPagoRepository;
    }

    async execute(cotizacionId) {
        return await this.registroPagoRepository.getByCotizacionId(cotizacionId);
    }
}

export default GetRegistroPagoByCotizacionId;
