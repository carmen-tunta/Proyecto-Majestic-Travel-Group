class CreateDatosViaje {
    constructor(datosViajeRepository) {
        this.datosViajeRepository = datosViajeRepository;
    }

    async execute(datosViaje) {
        return await this.datosViajeRepository.createDatosViaje(datosViaje);
    }
}

export default CreateDatosViaje;