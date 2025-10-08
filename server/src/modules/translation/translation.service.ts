import { Injectable } from '@nestjs/common';

// The package exports the REST/legacy v2 API under the `v2` namespace.
// Importing from internal build paths breaks TypeScript resolution (TS2307),
// so require the package at runtime and use the v2 namespace. We keep
// a loose `any` type for the client to avoid depending on internal typings.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { v2: TranslateV2 } = require('@google-cloud/translate');

@Injectable()
export class TranslationService {
  private translate: any;

  constructor() {
    this.translate = new TranslateV2.Translate({
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