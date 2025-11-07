class translateText {
    constructor(translationRepository) {
        this.translationRepository = translationRepository;
    }

    async execute(text, targetLanguage, sourceLanguage) {
        return await this.translationRepository.translateText(text, targetLanguage, sourceLanguage);
    }
}

export default translateText;