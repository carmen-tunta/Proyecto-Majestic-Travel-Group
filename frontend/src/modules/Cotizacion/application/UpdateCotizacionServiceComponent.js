import CotizacionRepository from '../repository/CotizacionRepository';

export default class UpdateCotizacionServiceComponent {
  constructor(repo = new CotizacionRepository()){
    this.repo = repo;
  }
  async execute(cscId, data){
    return await this.repo.updateServiceComponent(cscId, data);
  }
}
