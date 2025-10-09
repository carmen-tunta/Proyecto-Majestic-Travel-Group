class getDatosViajeByCotizacionId {
    constructor(datosViajeRepository) {
        this.datosViajeRepository = datosViajeRepository;
    }

    async execute(cotizacionId) {
        return await this.datosViajeRepository.getDatosViajeByCotizacionId(cotizacionId);
    }
}

export default getDatosViajeByCotizacionId;