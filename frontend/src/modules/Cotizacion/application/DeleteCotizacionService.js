import CotizacionRepository from '../repository/CotizacionRepository';

export default class DeleteCotizacionService {
  constructor(repo = new CotizacionRepository()){
    this.repo = repo;
  }
  async execute(csId){
    return await this.repo.deleteService(csId);
  }
}
