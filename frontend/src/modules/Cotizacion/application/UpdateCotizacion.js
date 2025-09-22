import CotizacionRepository from '../repository/CotizacionRepository';

export default class UpdateCotizacion {
  constructor(repo = new CotizacionRepository()){
    this.repo = repo;
  }
  async execute(id, data){
    return await this.repo.update(id, data);
  }
}
