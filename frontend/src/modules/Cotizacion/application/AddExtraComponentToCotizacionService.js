import CotizacionRepository from '../repository/CotizacionRepository';

export default class AddExtraComponentToCotizacionService {
  constructor(repo = new CotizacionRepository()){
    this.repo = repo;
  }
  async execute(csId, payload){
    return await this.repo.addExtraComponent(csId, payload);
  }
}
