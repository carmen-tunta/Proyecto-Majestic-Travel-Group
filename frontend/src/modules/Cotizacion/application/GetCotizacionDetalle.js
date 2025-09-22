import CotizacionRepository from '../repository/CotizacionRepository';

export default class GetCotizacionDetalle {
  constructor(repo = new CotizacionRepository()){
    this.repo = repo;
  }
  async execute(id){
    return await this.repo.getDetalle(id);
  }
}
