import { Controller, Post, Body } from '@nestjs/common';
import { TranslationService } from './translation.service';

interface TranslateRequest {
  text: string;
  source?: string;
  target: string;
}

@Controller('api/translate')
export class TranslationController {
  constructor(private readonly translationService: TranslationService) {}

  @Post()
  async translate(@Body() translateRequest: TranslateRequest) {
    try {
      const { text, source, target } = translateRequest;
      
      const translatedText = await this.translationService.translateText(
        text,
        target,
        source
      );
      
      return { translatedText };
    } catch (error) {
      return { error: 'Translation failed', message: error.message };
    }
  }

  @Post('detect')
  async detectLanguage(@Body() body: { text: string }) {
    try {
      const language = await this.translationService.detectLanguage(body.text);
      return { language };
    } catch (error) {
      return { error: 'Language detection failed', message: error.message };
    }
  }
}