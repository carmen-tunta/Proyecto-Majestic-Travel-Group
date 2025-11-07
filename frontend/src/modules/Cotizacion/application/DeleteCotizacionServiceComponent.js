import CotizacionRepository from '../repository/CotizacionRepository';

export default class DeleteCotizacionServiceComponent {
  constructor(repo = new CotizacionRepository()){
    this.repo = repo;
  }
  async execute(cscId){
    return await this.repo.deleteServiceComponent(cscId);
  }
}
