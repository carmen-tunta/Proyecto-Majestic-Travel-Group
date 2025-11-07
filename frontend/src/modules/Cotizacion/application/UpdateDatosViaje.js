class UpdateDatosViaje {
    constructor(datosViajeRepository) {
        this.datosViajeRepository = datosViajeRepository;
    }

    async execute(cId, datosViaje) {
        return await this.datosViajeRepository.updateDatosViaje(cId, datosViaje);
    }
}

export default UpdateDatosViaje;