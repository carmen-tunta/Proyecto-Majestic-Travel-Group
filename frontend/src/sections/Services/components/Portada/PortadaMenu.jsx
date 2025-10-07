import { Dropdown } from 'primereact/dropdown';
import '../../styles/Portada/MenuPortada.css';
import { Button } from "primereact/button";
import { TabMenu } from "primereact/tabmenu";
import { useState } from "react";
import { generatePath, useLocation, useNavigate } from "react-router-dom";
import { FloatLabel } from 'primereact/floatlabel';
import TituloPortada from './TituloPortada';
import TituloIzquierda from './TituloIzquierda';
import TituloDerecha from './TituloDerecha';
import TituloDoble from './TituloDoble';
import ContactoPortada from './ContactoPortada';
import html2pdf from 'html2pdf.js'
import html2canvas from 'html2canvas';
import { PDFDocument } from 'pdf-lib';;

const PortadaMenu = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const service = location.state?.service;

    const [activeIndex, setActiveIndex] = useState(0);

    const generatePDF = async () => {
        const originalIndex = activeIndex;
        
        try {
            const menu = document.querySelector('.portada-menu');
            if (menu) menu.style.display = 'none';

            const pages = [
                { index: 0, selector: '.portada-container', name: 'Portada' },
                { index: 1, selector: '.titulo-derecha', name: 'Titulo-Derecha' },
                { index: 2, selector: '.titulo-izquierda', name: 'Titulo-Izquierda' },
                { index: 3, selector: '.titulo-doble', name: 'Titulo-Doble' },
                { index: 4, selector: '.contacto-portada-container', name: 'Contacto' }
            ];

            const pdfBlobs = [];

            const waitForLoading = () => {
                return new Promise((resolve) => {
                    const checkLoading = () => {
                        const loadingSpinner = document.querySelector('.spinner-portada-container');
                        const progressSpinner = document.querySelector('.p-progress-spinner');
                        
                        if (!loadingSpinner && !progressSpinner) {
                            resolve();
                        } else {
                            setTimeout(checkLoading, 100);
                        }
                    };
                    checkLoading();
                });
            };

            for (let i = 0; i < pages.length; i++) {
                console.log(`Generando ${pages[i].name}...`);
                
                setActiveIndex(pages[i].index);
                
                await waitForLoading();
                await new Promise(resolve => setTimeout(resolve, 500));
                
                const editarIcons = document.querySelectorAll('.pi-pencil');
                const dbIcons = document.querySelectorAll('.pi-database');
                const imageIcons = document.querySelectorAll('.pi-image');
                
                editarIcons.forEach(icon => icon.style.display = 'none');
                dbIcons.forEach(icon => icon.style.display = 'none');
                imageIcons.forEach(icon => icon.style.display = 'none');
                
                const element = document.querySelector(pages[i].selector);
                
                if (element) {
                    window.scrollTo(0, 0);
                    if (element.scrollTop !== undefined) {
                        element.scrollTop = 0;
                    }
    
                    await new Promise(resolve => setTimeout(resolve, 100));


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
                            letterRendering: true
                        },
                        jsPDF: { 
                            unit: 'px',
                            format: [window.innerWidth, window.innerHeight], // Ajustar formato al contenido completo
                            orientation: 'landscape'                        }
                    };

                    const pdfBlob = await html2pdf().set(opt).from(element).output('blob');
                    pdfBlobs.push(pdfBlob);
                }
                editarIcons.forEach(icon => icon.style.display = 'inline-block');
                dbIcons.forEach(icon => icon.style.display = 'inline-block');
                imageIcons.forEach(icon => icon.style.display = 'inline-block');
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

    return (
        <>
        <div className="portada-menu">
            <TabMenu model={[
                { label: 'Portada', icon: 'pi pi-home'},
                { label: 'Título Der', icon: 'pi pi-align-right'},
                { label: 'Título Izq', icon: 'pi pi-align-left'},
                { label: 'Doble', icon: 'pi pi-align-justify'},
                { label: 'Contacto', icon: 'pi pi-address-book'}
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
                    options={['Español', 'Inglés', 'Francés', 'Portugués', 'Italiano']} 
                />
                <label htmlFor="idiomaOrigen">Idioma origen</label>
            </FloatLabel>

            <FloatLabel>
                <Dropdown 
                    className='dropdown-menu'
                    panelClassName='portada-dropdown-panel'
                    id='idiomaDestino' 
                    options={['Español', 'Inglés', 'Francés', 'Portugués', 'Italiano']} 
                />
                <label htmlFor="idiomaDestino">Idioma destino</label>
            </FloatLabel>

            <Button 
                label="Traducir y descargar pdf" 
                icon="pi pi-google"
                size='small'
                onClick={() => navigate(-1)} 
            />

            

        </div>
        {activeIndex === 0 && (
                <TituloPortada service={service} />
            )}
            {activeIndex === 1 && (
                <TituloDerecha service={service} />
            )}
            {activeIndex === 2 && (
                <TituloIzquierda service={service} />
            )}
            {activeIndex === 3 && (
                <TituloDoble service={service} />
            )}
            {activeIndex === 4 && (
                <ContactoPortada service={service} />
            )}
        </>

        
    );
    };

export default PortadaMenu;
