import CotizacionRepository from '../repository/CotizacionRepository';

export default class GetAllCotizaciones {
  constructor(repo = new CotizacionRepository()){
    this.repo = repo;
  }
  async execute(){
    return await this.repo.getAll();
  }
}
