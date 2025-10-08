import { Dropdown } from 'primereact/dropdown';
import '../../styles/Portada/MenuPortada.css';
import { Button } from "primereact/button";
import { TabMenu } from "primereact/tabmenu";
import { useEffect, useState } from "react";
import { generatePath, useLocation, useNavigate } from "react-router-dom";
import { FloatLabel } from 'primereact/floatlabel';
import TituloPortada from './TituloPortada';
import TituloIzquierda from './TituloIzquierda';
import TituloDerecha from './TituloDerecha';
import TituloDoble from './TituloDoble';
import ContactoPortada from './ContactoPortada';
import html2pdf from 'html2pdf.js'
import html2canvas from 'html2canvas';
import { PDFDocument } from 'pdf-lib'; import TranslationRepository from '../../../../modules/Translation/repository/TranslationRepository';
import translateText from '../../../../modules/Translation/application/TranslateText';
;

const PortadaMenu = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const service = location.state?.service;

    const [activeIndex, setActiveIndex] = useState(0);

    const [translating, setTranslating] = useState(false);
    const [selectedSourceLanguage, setSelectedSourceLanguage] = useState(null);
    const [selectedTargetLanguage, setSelectedTargetLanguage] = useState(null);
    const [deletedPages, setDeletedPages] = useState(new Set());

    const translateRepo = new TranslationRepository();
    const translate = new translateText(translateRepo);

    const handlePageToggle = (pageKey, isDeleted) => {
        setDeletedPages(prev => {
            const newSet = new Set(prev);
            if (isDeleted) {
                newSet.add(pageKey);
            } else {
                newSet.delete(pageKey);
            }
            return newSet;
        });
    };

    const generatePDF = async () => {
        const originalIndex = activeIndex;

        try {
            const menu = document.querySelector('.portada-menu');
            if (menu) menu.style.display = 'none';

            const allPages = [
                { index: 0, selector: '.portada-container', name: 'Portada', key: 'portada' },
                { index: 1, selector: '.titulo-derecha', name: 'Titulo-Derecha', key: 'titulo-derecha' },
                { index: 2, selector: '.titulo-izquierda', name: 'Titulo-Izquierda', key: 'titulo-izquierda' },
                { index: 3, selector: '.titulo-doble', name: 'Titulo-Doble', key: 'titulo-doble' },
                { index: 4, selector: '.contacto-portada-container', name: 'Contacto', key: 'contacto' }
            ];

            const pages = allPages.filter(page => !deletedPages.has(page.key));

            if (pages.length === 0) {
                console.warn('No hay páginas para generar PDF');
                return;
            }

            const pdfBlobs = [];

            const waitForLoading = () => {
                return new Promise((resolve) => {
                    const checkLoading = () => {
                        const loadingSpinner = document.querySelector('.spinner-portada-container');
                        const progressSpinner = document.querySelector('.p-progress-spinner');

                        if (!loadingSpinner && !progressSpinner) {
                            resolve();
                        } else {
                            setTimeout(checkLoading, 300);
                        }
                    };
                    checkLoading();
                });
            };

            
            for (let i = 0; i < pages.length; i++) {

                setActiveIndex(pages[i].index);

                await waitForLoading();
                await new Promise(resolve => setTimeout(resolve, 1500));

                const editarIcons = document.querySelectorAll('.pi-pencil');
                const dbIcons = document.querySelectorAll('.pi-database');
                const imageIcons = document.querySelectorAll('.pi-image');
                const deleteIcons = document.querySelectorAll('.pi-trash, .pi-undo');

                editarIcons.forEach(icon => icon.style.display = 'none');
                dbIcons.forEach(icon => icon.style.display = 'none');
                imageIcons.forEach(icon => icon.style.display = 'none');
                deleteIcons.forEach(icon => icon.style.display = 'none');

                const element = document.querySelector(pages[i].selector);

                if (element && !element.classList.contains('page-deleted')) {
                    window.scrollTo(0, 0);
                    if (element.scrollTop !== undefined) {
                        element.scrollTop = 0;
                    }

                    await new Promise(resolve => setTimeout(resolve, 1200));


                    const opt = {
                        margin: 0,
                        image: { type: 'jpg', quality: 0.99 },
                        html2canvas: {
                            scale: 1,
                            useCORS: true,
                            allowTaint: true,
                            backgroundColor: '#ffffff',
                            width: window.innerWidth,
                            height: window.innerHeight,
                            scrollX: 0,
                            scrollY: 0,
                            windowWidth: window.innerWidth,
                            windowHeight: window.innerHeight,
                            letterRendering: true,
                            ignoreElements: function(element) {
                                return element.classList && (
                                    element.classList.contains('ql-ui') || 
                                    element.classList.contains('page-deleted')
                                );
                            }
                        },
                        jsPDF: {
                            unit: 'px',
                            format: [window.innerWidth, window.innerHeight], // Ajustar formato al contenido completo
                            orientation: 'landscape'
                        }
                    };

                    const pdfBlob = await html2pdf().set(opt).from(element).output('blob');
                    pdfBlobs.push(pdfBlob);
                }
                editarIcons.forEach(icon => icon.style.display = 'inline-block');
                dbIcons.forEach(icon => icon.style.display = 'inline-block');
                imageIcons.forEach(icon => icon.style.display = 'inline-block');
                deleteIcons.forEach(icon => icon.style.display = 'inline-block');
            }
            console.log('Combinando PDFs...');
            const mergedPdf = await PDFDocument.create();

            for (let i = 0; i < pdfBlobs.length; i++) {
                const pdfBytes = await pdfBlobs[i].arrayBuffer();
                const pdf = await PDFDocument.load(pdfBytes);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }

            const pdfBytes = await mergedPdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `portada-completa-${service?.name || 'servicio'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            console.log('PDF combinado generado exitosamente');

        } catch (error) {
            console.error('Error generando PDF combinado:', error);
        } finally {
            setActiveIndex(originalIndex);

            const menu = document.querySelector('.portada-menu');
            if (menu) menu.style.display = 'flex';
        }
    };

    const replaceTextInHTML = async (html, sourceLanguage, targetLanguage, translate) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // Encontrar solo nodos de texto que no estén dentro de elementos problemáticos
        const walker = document.createTreeWalker(
            tempDiv,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function (node) {
                    // Filtrar nodos de texto problemáticos
                    const parent = node.parentElement;
                    if (!parent) return NodeFilter.FILTER_REJECT;

                    // Rechazar nodos dentro de elementos con clases problemáticas
                    if (parent.classList.contains('ql-ui') ||
                        parent.classList.contains('link-content-icon') ||
                        parent.tagName === 'I') {
                        return NodeFilter.FILTER_REJECT;
                    }

                    // Solo aceptar nodos con texto real
                    const text = node.textContent.trim();
                    if (text && text.length > 0) {
                        return NodeFilter.FILTER_ACCEPT;
                    }

                    return NodeFilter.FILTER_REJECT;
                }
            },
            false
        );

        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }

        // Traducir cada nodo de texto individualmente
        for (let textNode of textNodes) {
            const originalText = textNode.textContent.trim();
            if (originalText && originalText.length > 1) { // Ignorar texto de un solo caracter
                try {
                    const translatedResult = await translate.execute(
                        originalText,
                        targetLanguage,
                        sourceLanguage
                    );

                    // Verificar que la traducción sea válida
                    if (translatedResult &&
                        translatedResult.translatedText &&
                        typeof translatedResult.translatedText === 'string') {
                        textNode.textContent = translatedResult.translatedText;
                    } else {
                        console.warn('Traducción inválida para:', originalText, translatedResult);
                    }
                } catch (error) {
                    console.error('Error traduciendo:', originalText, error);
                }
            }
        }

        return tempDiv.innerHTML;
    };

    const translateAndGeneratePDF = async () => {
        const originalIndex = activeIndex;
        setTranslating(true);

        try {
            const menu = document.querySelector('.portada-menu');
            if (menu) menu.style.display = 'none';

            const allPages = [
                { index: 0, selector: '.portada-container', name: 'Portada', key: 'portada' },
                { index: 1, selector: '.titulo-derecha', name: 'Titulo-Derecha', key: 'titulo-derecha' },
                { index: 2, selector: '.titulo-izquierda', name: 'Titulo-Izquierda', key: 'titulo-izquierda' },
                { index: 3, selector: '.titulo-doble', name: 'Titulo-Doble', key: 'titulo-doble' },
                { index: 4, selector: '.contacto-portada-container', name: 'Contacto', key: 'contacto' }
            ];

            // Filtrar páginas no eliminadas
            
            const pages = allPages.filter(page => !deletedPages.has(page.key));

            if (pages.length === 0) {
                console.warn('No hay páginas para generar PDF');
                return;
            }

            const pdfBlobs = [];
            const waitForLoading = () => {
                return new Promise((resolve) => {
                    const checkLoading = () => {
                        const loadingSpinner = document.querySelector('.spinner-portada-container');
                        const progressSpinner = document.querySelector('.p-progress-spinner');

                        if (!loadingSpinner && !progressSpinner) {
                            resolve();
                        } else {
                            setTimeout(checkLoading, 300);
                        }
                    };
                    checkLoading();
                });
            };

            for (let i = 0; i < pages.length; i++) {
                console.log(`Traduciendo y generando ${pages[i].name}...`);

                setActiveIndex(pages[i].index);
                await waitForLoading();
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Ocultar iconos
                const editarIcons = document.querySelectorAll('.pi-pencil');
                const dbIcons = document.querySelectorAll('.pi-database');
                const imageIcons = document.querySelectorAll('.pi-image');
                const deleteIcons = document.querySelectorAll('.pi-trash, .pi-undo');

                editarIcons.forEach(icon => icon.style.display = 'none');
                dbIcons.forEach(icon => icon.style.display = 'none');
                imageIcons.forEach(icon => icon.style.display = 'none');
                deleteIcons.forEach(icon => icon.style.display = 'none');

                const element = document.querySelector(pages[i].selector);

                if (element && !element.classList.contains('page-deleted')) {
                    // Encontrar elementos de texto para traducir
                    const titleElements = element.querySelectorAll('.titulo');
                    const contentElements = element.querySelectorAll('.contenido');
                    const contactElements = element.querySelectorAll('.contacto');

                    const originalTexts = [];

                    // Traducir títulos
                    for (let titleEl of titleElements) {
                        const originalHTML = titleEl.innerHTML;
                        if (originalHTML.trim()) {
                            const translatedHTML = await replaceTextInHTML(
                                originalHTML,
                                selectedSourceLanguage,
                                selectedTargetLanguage,
                                translate
                            );
                            titleEl.innerHTML = translatedHTML;
                            originalTexts.push({ element: titleEl, original: originalHTML });
                        }
                    }

                    // Traducir contenido
                    for (let contentEl of contentElements) {
                        const originalHTML = contentEl.innerHTML;
                        if (originalHTML.trim()) {
                            const translatedHTML = await replaceTextInHTML(
                                originalHTML,
                                selectedSourceLanguage,
                                selectedTargetLanguage,
                                translate
                            );
                            contentEl.innerHTML = translatedHTML;
                            originalTexts.push({ element: contentEl, original: originalHTML });
                        }
                    }

                    // Traducir contacto
                    for (let contactEl of contactElements) {
                        const originalHTML = contactEl.innerHTML;
                        if (originalHTML.trim()) {
                            const translatedHTML = await replaceTextInHTML(
                                originalHTML,
                                selectedSourceLanguage,
                                selectedTargetLanguage,
                                translate
                            );
                            contactEl.innerHTML = translatedHTML;
                            originalTexts.push({ element: contactEl, original: originalHTML });
                        }
                    }

                    // Esperar un momento para que se rendericen los cambios
                    await new Promise(resolve => setTimeout(resolve, 700));

                    // Resetear scroll
                    window.scrollTo(0, 0);
                    if (element.scrollTop !== undefined) {
                        element.scrollTop = 0;
                    }
                    await new Promise(resolve => setTimeout(resolve, 700));

                    // Generar PDF con contenido traducido
                    const opt = {
                        margin: 0,
                        image: { type: 'jpg', quality: 0.99 },
                        html2canvas: {
                            scale: 1,
                            useCORS: true,
                            allowTaint: true,
                            backgroundColor: '#ffffff',
                            width: window.innerWidth,
                            height: window.innerHeight,
                            scrollX: 0,
                            scrollY: 0,
                            windowWidth: window.innerWidth,
                            windowHeight: window.innerHeight,
                            letterRendering: true,
                            ignoreElements: function(element) {
                                return element.classList && (
                                    element.classList.contains('ql-ui') || 
                                    element.classList.contains('page-deleted')
                                );
                            }
                        },
                        jsPDF: {
                            unit: 'px',
                            format: [window.innerWidth, window.innerHeight],
                            orientation: 'landscape'
                        }
                    };

                    const pdfBlob = await html2pdf().set(opt).from(element).output('blob');
                    pdfBlobs.push(pdfBlob);

                    // Restaurar textos originales
                    originalTexts.forEach(({ element, original }) => {
                        element.innerHTML = original;
                    });
                }

                // Mostrar iconos de nuevo
                editarIcons.forEach(icon => icon.style.display = 'inline-block');
                dbIcons.forEach(icon => icon.style.display = 'inline-block');
                imageIcons.forEach(icon => icon.style.display = 'inline-block');
                deleteIcons.forEach(icon => icon.style.display = 'inline-block');
            }

            // Combinar PDFs traducidos
            console.log('Combinando PDFs traducidos...');
            const mergedPdf = await PDFDocument.create();

            for (let i = 0; i < pdfBlobs.length; i++) {
                const pdfBytes = await pdfBlobs[i].arrayBuffer();
                const pdf = await PDFDocument.load(pdfBytes);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }

            const pdfBytes = await mergedPdf.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `portada-${selectedTargetLanguage}-${service?.name || 'servicio'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            console.log('PDF traducido generado exitosamente');

        } catch (error) {
            console.error('Error generando PDF traducido:', error);
        } finally {
            setTranslating(false);
            setActiveIndex(originalIndex);

            const menu = document.querySelector('.portada-menu');
            if (menu) menu.style.display = 'flex';
        }
    };

    return (
        <>
            <div className="portada-menu">
                <TabMenu model={[
                    { label: 'Portada', icon: 'pi pi-home' },
                    { label: 'Título Der', icon: 'pi pi-align-right' },
                    { label: 'Título Izq', icon: 'pi pi-align-left' },
                    { label: 'Doble', icon: 'pi pi-align-justify' },
                    { label: 'Contacto', icon: 'pi pi-address-book' }
                ]}
                    activeIndex={activeIndex}
                    onTabChange={(e) => setActiveIndex(e.index)}
                />
                <Button
                    label="Descargar pdf"
                    icon="pi pi-file-pdf"
                    size="small"
                    outlined
                    onClick={generatePDF}
                />
                <FloatLabel>
                    <Dropdown
                        className='dropdown-menu'
                        panelClassName='portada-dropdown-panel'
                        id='idiomaOrigen'
                        value={selectedSourceLanguage}
                        onChange={(e) => setSelectedSourceLanguage(e.value)}
                        options={[
                            { label: 'Español', value: 'es' },
                            { label: 'Inglés', value: 'en' },
                            { label: 'Francés', value: 'fr' },
                            { label: 'Portugués', value: 'pt' },
                            { label: 'Italiano', value: 'it' }
                        ]}
                        optionLabel="label"
                        optionValue="value"
                    />
                    <label
                        className={`label-dropdown ${selectedSourceLanguage ? 'has-language-selection' : ''}`}
                        htmlFor="idiomaOrigen"
                    >
                        Idioma origen
                    </label>
                </FloatLabel>

                <FloatLabel>
                    <Dropdown
                        className='dropdown-menu'
                        panelClassName='portada-dropdown-panel'
                        id='idiomaDestino'
                        value={selectedTargetLanguage}
                        onChange={(e) => setSelectedTargetLanguage(e.value)}
                        options={[
                            { label: 'Español', value: 'es' },
                            { label: 'Inglés', value: 'en' },
                            { label: 'Francés', value: 'fr' },
                            { label: 'Portugués', value: 'pt' },
                            { label: 'Italiano', value: 'it' }
                        ]}
                        optionLabel="label"
                        optionValue="value"
                    />
                    <label
                        className={`label-dropdown ${selectedTargetLanguage ? 'has-language-selection' : ''}`}
                        htmlFor="idiomaDestino"
                    >
                        Idioma destino
                    </label>
                </FloatLabel>

                <Button
                    label={translating ? "Traduciendo..." : "Traducir y descargar pdf"}
                    icon={translating ? "pi pi-spin pi-spinner" : "pi pi-google"}
                    size='small'
                    onClick={translateAndGeneratePDF}
                    disabled={translating || selectedSourceLanguage === selectedTargetLanguage || !selectedSourceLanguage || !selectedTargetLanguage}
                    loading={translating}
                />



            </div>
            {activeIndex === 0 && (
                <TituloPortada service={service} onPageToggle={handlePageToggle} />
            )}
            {activeIndex === 1 && (
                <TituloDerecha service={service} onPageToggle={handlePageToggle} />
            )}
            {activeIndex === 2 && (
                <TituloIzquierda service={service} onPageToggle={handlePageToggle} />
            )}
            {activeIndex === 3 && (
                <TituloDoble service={service} onPageToggle={handlePageToggle} />
            )}
            {activeIndex === 4 && (
                <ContactoPortada service={service} onPageToggle={handlePageToggle} />
            )}
        </>


    );
};

export default PortadaMenu;
