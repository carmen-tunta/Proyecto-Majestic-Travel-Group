import { Injectable } from '@nestjs/common';
import { Translate } from '@google-cloud/translate/build/src/v2';

@Injectable()
export class TranslationService {
  private translate: Translate;

  constructor() {
    this.translate = new Translate({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
  }

  async translateText(text: string, targetLanguage: string, sourceLanguage?: string): Promise<string> {
    try {
      const translateOptions: any = {
        to: targetLanguage,
      };
      if (sourceLanguage) {
        translateOptions.from = sourceLanguage;
      }
      const [translation] = await this.translate.translate(text, translateOptions);
      return translation;
    } catch (error) {
      console.error('Translation error:', error);
      throw new Error(`Translation failed: ${error.message}`);
    }
  }

  async detectLanguage(text: string): Promise<string> {
    try {
      const [detection] = await this.translate.detect(text);
      return detection.language;
    } catch (error) {
      console.error('Language detection error:', error);
      throw new Error(`Language detection failed: ${error.message}`);
    }
  }
}