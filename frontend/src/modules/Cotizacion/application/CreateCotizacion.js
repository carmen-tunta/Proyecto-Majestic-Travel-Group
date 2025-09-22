import CotizacionRepository from '../repository/CotizacionRepository';

export default class CreateCotizacion {
  constructor(repo = new CotizacionRepository()){
    this.repo = repo;
  }
  async execute(data){
    return await this.repo.create(data);
  }
}
