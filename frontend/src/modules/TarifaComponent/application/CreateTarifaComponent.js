class CreateTarifaComponent {
  constructor(tarifaComponentRepo) {
    this.tarifaComponentRepo = tarifaComponentRepo;
  }

  async execute(data) {
    return await this.tarifaComponentRepo.create(data);
  }
}
export default CreateTarifaComponent;