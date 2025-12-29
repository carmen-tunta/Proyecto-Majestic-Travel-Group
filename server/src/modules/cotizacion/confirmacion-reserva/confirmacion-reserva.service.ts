import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfirmacionReserva } from '../entities/confirmacion-reserva.entity';
import { PDFDocument, StandardFonts, rgb, PDFFont, PDFArray, PDFName, PDFPage } from 'pdf-lib';
import * as https from 'https';
import * as http from 'http';

@Injectable()
export class ConfirmacionReservaService {
  constructor(
    @InjectRepository(ConfirmacionReserva)
    private confirmacionReservaRepository: Repository<ConfirmacionReserva>,
  ) {}

  async getByCotizacionId(cotizacionId: number): Promise<ConfirmacionReserva | null> {
    return this.confirmacionReservaRepository.findOne({ where: { cotizacionId } });
  }

  async create(data: Partial<ConfirmacionReserva>): Promise<ConfirmacionReserva> {
    const confirmacion = this.confirmacionReservaRepository.create(data);
    return this.confirmacionReservaRepository.save(confirmacion);
  }

  async createOrUpdate(cotizacionId: number, data: Partial<ConfirmacionReserva>): Promise<ConfirmacionReserva | null> {
    const existing = await this.getByCotizacionId(cotizacionId);
    
    if (existing) {
      // Filtrar solo los campos definidos para actualizar
      const filteredData = Object.keys(data).reduce((acc, key) => {
        // Permitir paginasEditables incluso si es null o vacío
        if (key === 'paginasEditables' || (data[key] !== undefined && data[key] !== null)) {
          acc[key] = data[key];
        }
        return acc;
      }, {} as any);

      if (Object.keys(filteredData).length > 0) {
        await this.confirmacionReservaRepository.update(existing.id, filteredData);
      }

      return this.confirmacionReservaRepository.findOne({ 
        where: { id: existing.id }
      });
    } else {
      console.log(`Creando nueva confirmación de reserva para cotización ${cotizacionId}`);
      return this.create({ ...data, cotizacionId });
    }
  }

  async update(id: string, data: Partial<ConfirmacionReserva>): Promise<ConfirmacionReserva | null> {
    const numericId = Number(id);
    
    if (!data || Object.keys(data).length === 0) {
      return this.confirmacionReservaRepository.findOne({ 
        where: { id: numericId } 
      });
    }

    const filteredData = Object.keys(data).reduce((acc, key) => {
      if (data[key] !== undefined) {
        acc[key] = data[key];
      }
      return acc;
    }, {} as any);

    if (Object.keys(filteredData).length > 0) {
      await this.confirmacionReservaRepository.update(numericId, filteredData);
    }

    return this.confirmacionReservaRepository.findOne({ 
      where: { id: numericId },
    });
  }

  async confirmacionReservaGenerarPDF(
    idCotizacion: number,
    usuario: string,
    attachmentPdf?: Buffer,
  ): Promise<Buffer> {
    const sanitizedUsuario = usuario?.trim().slice(0, 15);
    if (!sanitizedUsuario) {
      throw new Error('El parámetro usuario es obligatorio para generar el PDF');
    }

    const spResult = await this.confirmacionReservaRepository.query(
      'CALL confirmacion_reserva_generarpdf(?, ?)',
      [idCotizacion, sanitizedUsuario],
    );

    const payload = this.resolveSpPayload(spResult);
    if (!payload) {
      throw new Error('No se encontró información para generar el PDF');
    }

    const pdfDoc = await PDFDocument.create();
    const pageSize: [number, number] = [595.28, 841.89];
    let page = pdfDoc.addPage(pageSize);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const margin = 40;
    const defaultFontSize = 10;
    const lineHeight = defaultFontSize + 4;
    const cardColor = rgb(249 / 255, 250 / 255, 251 / 255);
    const footerColor = rgb(239 / 255, 246 / 255, 255 / 255);

    let { width, height } = page.getSize();
    let cursorY = height - margin;

    const ensureSpace = (needed: number) => {
      if (cursorY - needed < margin) {
        page = pdfDoc.addPage(pageSize);
        width = page.getWidth();
        height = page.getHeight();
        cursorY = height - margin;
      }
    };

    const drawText = (
      text: string,
      x: number,
      y: number,
      options?: { font?: any; size?: number; color?: ReturnType<typeof rgb> },
    ) => {
      if (!text) {
        return;
      }
      page.drawText(text, {
        x,
        y,
        font: options?.font ?? regularFont,
        size: options?.size ?? defaultFontSize,
        color: options?.color ?? rgb(0, 0, 0),
      });
    };

    const drawLabelValue = (label: string, value: string | number | undefined, x: number, y: number) => {
      const labelText = `${label}:`;
      drawText(labelText, x, y, { font: boldFont });
      const labelWidth = boldFont.widthOfTextAtSize(labelText, defaultFontSize) + 4;
      drawText(value ? String(value) : '', x + labelWidth, y, { font: regularFont });
    };

    const addLinkAnnotation = (
      x: number,
      y: number,
      width: number,
      height: number,
      url?: string,
      targetPage: PDFPage = page,
    ) => {
      if (!url) {
        return;
      }
      const linkAnnotation = pdfDoc.context.obj({
        Type: 'Annot',
        Subtype: 'Link',
        Rect: [x, y, x + width, y + height],
        Border: [0, 0, 0],
        A: pdfDoc.context.obj({
          Type: 'Action',
          S: 'URI',
          URI: url,
        }),
      });

      const existingAnnots = targetPage.node.lookupMaybe(PDFName.of('Annots'), PDFArray);
      if (existingAnnots) {
        existingAnnots.push(linkAnnotation);
      } else {
        const annotationArray = PDFArray.withContext(pdfDoc.context);
        annotationArray.push(linkAnnotation);
        targetPage.node.set(PDFName.of('Annots'), annotationArray);
      }
    };

    const header = payload.header ?? {};
    const principal = payload.principal ?? {};
    const passengers = Array.isArray(payload.passengers) ? payload.passengers : [];
    const rawItinerary = Array.isArray(payload.itinerary) ? payload.itinerary : [];
    const itinerary = this.sortItineraryByDate(rawItinerary);
    const contact = payload.contact ?? {};
    const socialLinks = Array.isArray(payload.links_redes_sociales) ? payload.links_redes_sociales : [];

    const applyPlaceholders = (value?: string) =>
      value
        ? value
            .replace(/\[name_client\]/gi, principal.name_client ?? '')
            .replace(/\[reserve_status\]/gi, principal.reserve_status ?? '')
        : '';

    ensureSpace(90);
    let logoBlockHeight = 0;
    const titleY = cursorY - 20;
    const subtitleY = cursorY - 44;

    if (header.logo_url) {
      const logoBytes = await this.fetchBinaryFromUrl(header.logo_url);
      if (logoBytes) {
        try {
          const isPng = header.logo_url.toLowerCase().endsWith('.png');
          const embeddedLogo = isPng ? await pdfDoc.embedPng(logoBytes) : await pdfDoc.embedJpg(logoBytes);
          const scaledLogo = embeddedLogo.scale((90 * 1.1) / embeddedLogo.width);
          const logoY = Math.max(titleY - scaledLogo.height / 2, margin);
          page.drawImage(embeddedLogo, {
            x: margin,
            y: logoY,
            width: scaledLogo.width,
            height: scaledLogo.height,
          });
          logoBlockHeight = scaledLogo.height + 10;
        } catch {
          logoBlockHeight = 0;
        }
      }
    }

    const title = header.title ?? 'Confirmación de reserva';
    const titleSize = 16;
    const titleWidth = boldFont.widthOfTextAtSize(title, titleSize);
    const titleX = (width - titleWidth) / 2;

    const subtitle = applyPlaceholders(header.sub_title);
    const subtitleSize = 12;
    const subtitleWidth = subtitle ? regularFont.widthOfTextAtSize(subtitle, subtitleSize) : 0;
    const subtitleX = subtitle ? (width - subtitleWidth) / 2 : titleX;

    // --- Título principal ---
    drawText(title, titleX, titleY, {
      font: boldFont,
      size: titleSize,
    });

    drawText(subtitle, subtitleX, subtitleY, {
      font: regularFont,
      size: subtitleSize,
    });

    const reserveTitle = header.reserve_title ?? 'Estado de reserva';
    const reserveTitleSize = 9;
    const reserveTitleWidth = boldFont.widthOfTextAtSize(reserveTitle, reserveTitleSize);
    const reserveTitleX = width - margin - reserveTitleWidth;

    const reserveSubtitle = applyPlaceholders(header.reserve_sub_title);
    const reserveSubtitleSize = 9;
    const reserveSubtitleWidth = reserveSubtitle
      ? regularFont.widthOfTextAtSize(reserveSubtitle, reserveSubtitleSize)
      : 0;
    const reserveSubtitleX = reserveSubtitle ? width - margin - reserveSubtitleWidth : reserveTitleX;

    // --- Título estado de reserva ---
    drawText(reserveTitle, reserveTitleX, cursorY - 20, {
      font: boldFont,
      size: reserveTitleSize,
    });

    drawText(reserveSubtitle, reserveSubtitleX, cursorY - 38, {
      font: regularFont,
      size: reserveSubtitleSize,
    });

    cursorY -= Math.max(logoBlockHeight + 20, 80);

    const cardWidth = width - margin * 2;
    const leftColX = margin + 15;
    const rightColX = margin + cardWidth / 2 + 10;
    const leftColumnRows = [
      { label: 'Nombre', value: principal.name_client },
      { label: 'Fuente', value: principal.source },
      { label: 'Inicio del servicio', value: principal.service_start },
    ];
    const rightColumnRows = [
      { label: 'Reservado por', value: principal.booking_by },
      { label: 'Whatsapp', value: principal.whatsapp },
      { label: 'Correo', value: principal.mail },
    ];
    const pairSpacing = lineHeight + 8;
    const baseCardHeight =
      lineHeight * leftColumnRows.length + pairSpacing * (leftColumnRows.length - 1) + 30;
    const cardHeight = baseCardHeight - 30;

    ensureSpace(cardHeight + 20);
    page.drawRectangle({
      x: margin,
      y: cursorY - cardHeight,
      width: cardWidth,
      height: cardHeight,
      color: cardColor,
    });

    let rowY = cursorY - 25;
    leftColumnRows.forEach((row, index) => {
      drawLabelValue(row.label, row.value, leftColX, rowY);
      drawLabelValue(rightColumnRows[index].label, rightColumnRows[index].value, rightColX, rowY);
      rowY -= pairSpacing;
    });

    cursorY -= cardHeight + 20;

    if (passengers.length) {
      const passengersCount = principal.nro_pax ?? passengers.length;
      const passengerLineSpacing = lineHeight + 4;
      // --- Título sección de pasajeros ---
      cursorY -= lineHeight;
      drawText(`${passengersCount} Pasajeros`, margin, cursorY, { font: boldFont, size: 13 });
      ensureSpace(60);  
      cursorY -= lineHeight+10;
      passengers.forEach((passenger) => {
        ensureSpace(passengerLineSpacing);
        drawText(`• ${passenger.passenger ?? ''}`, margin + 10, cursorY);
        cursorY -= passengerLineSpacing;
      });
      cursorY -= passengerLineSpacing;
    }
    ensureSpace(60);
    if (itinerary.length) {
      // --- Título sección de itinerario ---
      drawText('Itinerario', margin, cursorY, { font: boldFont, size: 13 });

      cursorY -= lineHeight;
      const tableWidth = width - margin * 2;
      const colWidths = [50, 100, tableWidth - 150];
      const headerHeight = lineHeight + 6;

      ensureSpace(headerHeight + 4);
      page.drawRectangle({
        x: margin,
        y: cursorY - headerHeight,
        width: tableWidth,
        height: headerHeight,
        color: cardColor,
      });

      const headerY = cursorY - headerHeight + lineHeight;
      const headerBaselineY = cursorY - headerHeight + (headerHeight - defaultFontSize) / 2;

      drawText('Día', margin + 10, headerBaselineY, { font: boldFont });
      drawText('Fecha', margin + colWidths[0] + 10, headerBaselineY, { font: boldFont });
      drawText('Servicios/Actividades', margin + colWidths[0] + colWidths[1] + 10, headerBaselineY, {
        font: boldFont,
      });

      cursorY -= headerHeight + 6;

      let currentDayNumber = 0;
      let previousDateKey: string | null = null;

      itinerary.forEach((item, index) => {
        const serviceLines = this.wrapText(item.service_name ?? '', colWidths[2] - 20, regularFont, defaultFontSize);
        const rowHeight = Math.max(lineHeight, serviceLines.length * lineHeight);
        ensureSpace(rowHeight + 6);

        const rowTopY = cursorY - lineHeight / 2;
        const dateText = this.formatDateToSpanish(item.date ?? '');
        const normalizedDate = dateText.trim() || `__${index}`;
        if (previousDateKey === null || normalizedDate !== previousDateKey) {
          currentDayNumber += 1;
          previousDateKey = normalizedDate;
        }

        drawText(String(currentDayNumber), margin + 10, rowTopY);
        drawText(dateText, margin + colWidths[0] + 10, rowTopY);

        serviceLines.forEach((line, lineIdx) => {
          drawText(
            line,
            margin + colWidths[0] + colWidths[1] + 10,
            rowTopY - lineIdx * lineHeight,
          );
        });

        cursorY -= rowHeight + 6;
      });
    }

    const footerHeight = 30;
    const footerFontSize = Math.max(6, defaultFontSize - 2);
    const socialIconSize = 16 * 0.8;
    const visibleSocialLinks = socialLinks.slice(0, 5);
    const socialIconAssets = await Promise.all(
      visibleSocialLinks.map(async (link) => {
        if (!link.url || !link.ruta_icon) {
          return { link, image: null };
        }
        const iconBytes = await this.fetchBinaryFromUrl(link.ruta_icon);
        if (!iconBytes) {
          return { link, image: null };
        }
        try {
          const isPng = link.ruta_icon.toLowerCase().endsWith('.png');
          const image = isPng ? await pdfDoc.embedPng(iconBytes) : await pdfDoc.embedJpg(iconBytes);
          return { link, image };
        } catch {
          return { link, image: null };
        }
      }),
    );

    const drawFooterOnPage = (targetPage: PDFPage) => {
      const pageWidth = targetPage.getWidth();
      targetPage.drawRectangle({
        x: 0,
        y: 0,
        width: pageWidth,
        height: footerHeight,
        color: footerColor,
      });

      const contactLine = [contact.address, contact.whatsapp].filter(Boolean).join(' | ');
      if (contactLine) {
        const contactY = footerHeight / 2 - footerFontSize / 2;
        targetPage.drawText(contactLine, {
          x: 15,
          y: contactY,
          font: regularFont,
          size: footerFontSize,
        });
        addLinkAnnotation(
          15,
          contactY,
          regularFont.widthOfTextAtSize(contactLine, footerFontSize),
          footerFontSize + 2,
          contact.whatsapp?.startsWith('http') ? contact.whatsapp : undefined,
          targetPage,
        );
      }

      const totalIconWidth =
        socialIconAssets.filter(({ image }) => image).length * socialIconSize +
        Math.max(0, socialIconAssets.filter(({ image }) => image).length - 1) * 12;
      let iconX = pageWidth - totalIconWidth - 20;
      const iconY = footerHeight / 2 - socialIconSize / 2;

      socialIconAssets.forEach(({ link, image }) => {
        if (!image || !link.url) {
          return;
        }
        targetPage.drawImage(image, {
          x: iconX,
          y: iconY,
          width: socialIconSize,
          height: socialIconSize,
        });
        addLinkAnnotation(iconX, iconY, socialIconSize, socialIconSize, link.url, targetPage);
        iconX += socialIconSize + 12;
      });
    };

    const basePages = pdfDoc.getPages();
    basePages.forEach((targetPage) => drawFooterOnPage(targetPage));

    if (attachmentPdf?.length) {
      try {
        const attachmentDoc = await PDFDocument.load(attachmentPdf);
        const attachmentPages = await pdfDoc.copyPages(attachmentDoc, attachmentDoc.getPageIndices());
        attachmentPages.forEach((copiedPage) => pdfDoc.addPage(copiedPage));
      } catch (error) {
        console.warn('No se pudo adjuntar el PDF proporcionado:', error);
      }
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  private resolveSpPayload(spResult: any): any {
    const pickFirst = (value: any): any => {
      if (Array.isArray(value) && value.length > 0) {
        return pickFirst(value[0]);
      }
      return value;
    };

    const firstRow = pickFirst(spResult);
    if (!firstRow) {
      return null;
    }

    if (typeof firstRow === 'string') {
      try {
        return JSON.parse(firstRow);
      } catch {
        return null;
      }
    }

    const container = firstRow as Record<string, any>;
    for (const key of ['result', 'json', 'payload', 'data']) {
      const candidate = container?.[key];
      if (candidate !== undefined) {
        try {
          return typeof candidate === 'string' ? JSON.parse(candidate) : candidate;
        } catch {
          return null;
        }
      }
    }

    try {
      return typeof container === 'string' ? JSON.parse(container) : container;
    } catch {
      return null;
    }
  }

  private sortItineraryByDate(items: any[]): any[] {
    const entries = Array.isArray(items)
      ? items.map((item, index) => ({ item, index }))
      : [];

    const parseDateValue = (value: string) => {
      const parsed = Date.parse(value);
      return Number.isNaN(parsed) ? null : parsed;
    };

    return entries
      .sort((a, b) => {
        const dateA = parseDateValue(a.item?.date ?? '');
        const dateB = parseDateValue(b.item?.date ?? '');

        if (dateA !== null && dateB !== null && dateA !== dateB) {
          return dateA - dateB;
        }

        if (dateA !== null && dateB === null) {
          return -1;
        }

        if (dateA === null && dateB !== null) {
          return 1;
        }

        const textComparison = (a.item?.date ?? '').localeCompare(b.item?.date ?? '');
        if (textComparison !== 0) {
          return textComparison;
        }

        return a.index - b.index;
      })
      .map(({ item }) => item);
  }

  private async fetchBinaryFromUrl(url: string): Promise<Uint8Array | null> {
    return new Promise((resolve) => {
      const client = url.startsWith('https') ? https : http;
      client
        .get(url, (response) => {
          const chunks: Uint8Array[] = [];
          response.on('data', (chunk) => {
            chunks.push(chunk);
          });
          response.on('end', () => {
            resolve(chunks.length > 0 ? this.concatUint8Arrays(chunks) : null);
          });
        })
        .on('error', () => {
          resolve(null);
        });
    });
  }

  private concatUint8Arrays(chunks: Uint8Array[]): Uint8Array {
    if (chunks.length === 1) {
      return chunks[0];
    }

    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    chunks.forEach((chunk) => {
      result.set(chunk, offset);
      offset += chunk.length;
    });
    return result;
  }

  private wrapText(
    text: string,
    maxWidth: number,
    font: PDFFont,
    fontSize: number,
  ): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach((word) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const width = font.widthOfTextAtSize(testLine, fontSize);

      if (width > maxWidth) {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  private formatDateToSpanish(rawValue: string): string {
    if (!rawValue) {
      return '';
    }

    const trimmed = rawValue.trim();
    const isoPattern = /^\d{4}-\d{2}-\d{2}$/;

    const formatWithIntl = (dateValue: Date) => {
      if (Number.isNaN(dateValue.getTime())) {
        return trimmed;
      }
      return new Intl.DateTimeFormat('es-ES', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: '2-digit',
      }).format(dateValue);
    };

    if (isoPattern.test(trimmed)) {
      return formatWithIntl(new Date(trimmed));
    }

    const parsedDate = new Date(trimmed);
    if (!Number.isNaN(parsedDate.getTime())) {
      return formatWithIntl(parsedDate);
    }

    const weekdayMap: Record<string, string> = {
      mon: 'Lun',
      tue: 'Mar',
      wed: 'Mié',
      thu: 'Jue',
      fri: 'Vie',
      sat: 'Sáb',
      sun: 'Dom',
    };
    const monthMap: Record<string, string> = {
      jan: 'ene',
      feb: 'feb',
      mar: 'mar',
      apr: 'abr',
      may: 'may',
      jun: 'jun',
      jul: 'jul',
      aug: 'ago',
      sep: 'sept',
      oct: 'oct',
      nov: 'nov',
      dec: 'dic',
    };

    const tokens = trimmed.split(/\s+/);
    if (tokens.length >= 4) {
      const [weekdayRaw, dayRaw, monthRaw, yearRaw] = tokens;
      const weekday = weekdayMap[weekdayRaw.toLowerCase()] ?? weekdayRaw;
      const month = monthMap[monthRaw.toLowerCase()] ?? monthRaw;
      return `${weekday} ${dayRaw} ${month} ${yearRaw}`;
    }

    return trimmed;
  }
}

