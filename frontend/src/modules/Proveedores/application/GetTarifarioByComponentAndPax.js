class GetProveedoresByComponentAndPax {
    constructor(proveedoresRepository) {
        this.proveedoresRepository = proveedoresRepository;
    }

    async execute(componentId, pax) {
        return await this.proveedoresRepository.getProveedoresByIdComponentAndPax(componentId, pax);
    }
}
export default GetProveedoresByComponentAndPax;