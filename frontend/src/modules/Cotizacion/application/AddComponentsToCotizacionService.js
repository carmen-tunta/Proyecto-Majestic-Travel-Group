import CotizacionRepository from '../repository/CotizacionRepository';

export default class AddComponentsToCotizacionService {
  constructor(repo = new CotizacionRepository()){
    this.repo = repo;
  }
  async execute(csId, componentIds){
    return await this.repo.addComponentsToService(csId, componentIds);
  }
}
