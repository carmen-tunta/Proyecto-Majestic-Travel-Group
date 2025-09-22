import CotizacionRepository from '../repository/CotizacionRepository';

export default class AddServiceToCotizacion {
  constructor(repo = new CotizacionRepository()){
    this.repo = repo;
  }
  async execute(cotizacionId, payload){
    return await this.repo.addService(cotizacionId, payload);
  }
}
