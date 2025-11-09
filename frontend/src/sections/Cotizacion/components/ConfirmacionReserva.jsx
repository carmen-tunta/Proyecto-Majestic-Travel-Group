import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { useNotification } from '../../Notification/NotificationContext';
import { ProgressSpinner } from 'primereact/progressspinner';
import PlantillaItinerarioModal from './PlantillaItinerarioModal';
import '../styles/ConfirmacionReservaEditor.css';
import html2pdf from 'html2pdf.js';
import { PDFDocument } from 'pdf-lib';
import TranslationRepository from '../../../modules/Translation/repository/TranslationRepository';
import translateText from '../../../modules/Translation/application/TranslateText';

const ConfirmacionReserva = ({ cotizacionId, cotizacionData }) => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingTranslate, setLoadingTranslate] = useState(false);
  
  // Función helper para obtener el estado del booking según el estado de la cotización
  const getEstadoBooking = (estado) => {
    if (!estado) return '';
    const estadoTrim = estado.trim();
    if (estadoTrim === 'Finalizado') {
      return 'Confirmado';
    } else if (estadoTrim === 'Cotización enviada') {
      return 'Cotizando';
    }
    return estado;
  };
  
  // Función helper para verificar si el estado es "Cotización enviada"
  const isCotizacionEnviada = (estado) => {
    return estado && estado.trim() === 'Cotización enviada';
  };
  
  // Sistema de páginas: la primera es fija (confirmación), las demás son editables
  const [editablePages, setEditablePages] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [confirmacionId, setConfirmacionId] = useState(null);
  
  // Idiomas (códigos ISO como en Portada)
  const [idiomaOrigen, setIdiomaOrigen] = useState('es');
  const [idiomaDestino, setIdiomaDestino] = useState('en');
  
  const idiomas = [
    { label: 'Español', value: 'es' },
    { label: 'Inglés', value: 'en' },
    { label: 'Francés', value: 'fr' },
    { label: 'Alemán', value: 'de' },
    { label: 'Portugués', value: 'pt' },
    { label: 'Italiano', value: 'it' }
  ];

  const translateRepo = new TranslationRepository();
  const translate = new translateText(translateRepo);
  
  // Modal de plantilla itinerario
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [currentBlockId, setCurrentBlockId] = useState(null);
  const [currentColumn, setCurrentColumn] = useState(null);
  const [renderKey, setRenderKey] = useState(0);

  // Cargar datos existentes
  useEffect(() => {
    loadConfirmacion();
  }, [cotizacionId]);

  // Ajustar automáticamente la altura de los textareas
  useEffect(() => {
    const textareas = document.querySelectorAll('.confirmacion-contenido-input');
    textareas.forEach(textarea => {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    });
  }, [editablePages, currentPageIndex]);

  const loadConfirmacion = async () => {
    if (!cotizacionId) return;
    
    setLoadingData(true);
    try {
      const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/cotizacion/${cotizacionId}/confirmacion-reserva`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setConfirmacionId(data.id);
          // Cargar páginas editables si existen
          if (data.paginasEditables) {
            try {
              const pages = JSON.parse(data.paginasEditables);
              setEditablePages(pages);
            } catch (e) {
              console.error('Error al parsear páginas editables:', e);
            }
          }
        }
      } else {
        console.log('No hay confirmación guardada aún');
      }
    } catch (error) {
      console.error('Error al cargar confirmación:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const formatFecha = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${meses[d.getMonth()]} ${d.getDate()} de ${String(d.getFullYear()).slice(-2)}`;
  };

  // Obtener itinerario de la cotización
  const getItinerario = () => {
    if (!cotizacionData || !cotizacionData.servicios) return [];

    const todosLosComponentes = [];

    // Recolectar todos los componentes de todos los servicios
    cotizacionData.servicios.forEach((servicio) => {
      const nombreServicio = servicio.service?.name || 'Servicio sin nombre';
      
      if (servicio.componentes && servicio.componentes.length > 0) {
        servicio.componentes.forEach((comp) => {
          const nombreComponente = comp.isExtra 
            ? comp.nombreExtra 
            : comp.component?.componentName || 'Componente';
          
          todosLosComponentes.push({
            nombreServicio,
            nombreComponente,
            scheduledAt: comp.scheduledAt,
            fechaOrden: comp.scheduledAt ? new Date(comp.scheduledAt).getTime() : Infinity,
          });
        });
      }
    });

    todosLosComponentes.sort((a, b) => a.fechaOrden - b.fechaOrden);

    const itinerario = todosLosComponentes.map((comp, index) => ({
      dia: index + 1,
      fecha: comp.scheduledAt ? formatFecha(new Date(comp.scheduledAt)) : '',
      actividad: `${comp.nombreServicio}: ${comp.nombreComponente}`,
    }));

    return itinerario;
  };

  // Funciones para manejar páginas editables
  const addNewPage = () => {
    const newPage = {
      id: Date.now(),
      blocks: []
    };
    setEditablePages([...editablePages, newPage]);
    setCurrentPageIndex(editablePages.length + 1);
  };

  const addRowBlock = () => {
    if (currentPageIndex === 0) return;
    
    const newBlock = {
      id: Date.now(),
      type: 'row',
      titulo: 'Titulo',
      contenido: 'Contenido'
    };
    const updatedPages = [...editablePages];
    updatedPages[currentPageIndex - 1].blocks.push(newBlock);
    setEditablePages(updatedPages);
  };

  const addDoubleBlock = () => {
    if (currentPageIndex === 0) return;
    
    const newBlock = {
      id: Date.now(),
      type: 'double',
      col1: { titulo: 'Titulo', contenido: 'Contenido' },
      col2: { titulo: 'Titulo', contenido: 'Contenido' }
    };
    const updatedPages = [...editablePages];
    updatedPages[currentPageIndex - 1].blocks.push(newBlock);
    setEditablePages(updatedPages);
  };

  const updateBlock = (blockId, field, value, column = null) => {
    const updatedPages = [...editablePages];
    const block = updatedPages[currentPageIndex - 1].blocks.find(b => b.id === blockId);
    if (block) {
      if (column) {
        block[column][field] = value;
      } else {
        block[field] = value;
      }
      setEditablePages(updatedPages);
      
      // Ajustar altura del textarea después de actualizar
      setTimeout(() => {
        const textareas = document.querySelectorAll('.confirmacion-contenido-input');
        textareas.forEach(textarea => {
          textarea.style.height = 'auto';
          textarea.style.height = textarea.scrollHeight + 'px';
        });
      }, 0);
    }
  };

  const deleteBlock = (blockId) => {
    const updatedPages = [...editablePages];
    updatedPages[currentPageIndex - 1].blocks = updatedPages[currentPageIndex - 1].blocks.filter(b => b.id !== blockId);
    setEditablePages(updatedPages);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const dataToSave = {
        cotizacionId,
        paginasEditables: JSON.stringify(editablePages)
      };

      // Obtener token de localStorage (donde se guarda actualmente)
      const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/cotizacion/${cotizacionId}/confirmacion-reserva`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(dataToSave)
        }
      );

      if (response.ok) {
        const data = await response.json();
        setConfirmacionId(data.id);
        showNotification('Documento guardado correctamente', 'success');
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Error al guardar: ${response.status}`);
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error al guardar el documento', 'error');
    } finally {
      setLoading(false);
    }
  };

  const confirmDeletePage = () => {
    if (currentPageIndex === 0 || editablePages.length === 0) return;
    
    confirmDialog({
      message: '¿Estás seguro de que deseas eliminar esta página? Esta acción no se puede deshacer.',
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptClassName: 'p-button-danger',
      accept: () => {
        const updatedPages = [...editablePages];
        updatedPages.splice(currentPageIndex - 1, 1);
        setEditablePages(updatedPages);
        
        // Ir a la página anterior
        if (currentPageIndex > updatedPages.length) {
          setCurrentPageIndex(Math.max(0, updatedPages.length));
        }
        
        showNotification('Página eliminada correctamente', 'success');
      },
      reject: () => {
        // No hacer nada si cancela
      }
    });
  };

  const handleDownloadPdf = async () => {
    setLoadingPdf(true);
    const originalIndex = currentPageIndex;
    const total = 1 + editablePages.length;
    const hiddenElements = [];

    const hideElement = (selector) => {
      const nodes = document.querySelectorAll(selector);
      nodes.forEach((n) => {
        hiddenElements.push({ node: n, display: n.style.display });
        n.style.display = 'none';
      });
    };

    try {
      // Ocultar controles e iconos antes de capturar
      hideElement('.confirmacion-editor-header');
      hideElement('.confirmacion-controls');
      hideElement('.confirmacion-pages-indicator');
      hideElement('.titulo-action-btn');

      // Añadir modo export a la página para ver solo texto
      const page = document.querySelector('.confirmacion-page');
      const pagePrevClass = page?.className || '';
      if (page) page.className = `${pagePrevClass} confirmacion-export`;

      const pdfBlobs = [];

      for (let i = 0; i < total; i++) {
        setCurrentPageIndex(i);
        // esperar render
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 400));

        const element = document.querySelector('.confirmacion-page');
        if (!element) continue;

        // Reemplazar inputs/textarea por nodos de texto temporales para respetar saltos
        const replacements = [];
        element.querySelectorAll('.confirmacion-titulo-input').forEach((inp) => {
          const div = document.createElement('div');
          div.className = 'confirmacion-title-export';
          div.textContent = inp.value || inp.getAttribute('value') || '';
          inp.parentNode.insertBefore(div, inp);
          replacements.push({ original: inp, replacement: div });
          inp.style.display = 'none';
        });
        element.querySelectorAll('.confirmacion-contenido-input').forEach((ta) => {
          const div = document.createElement('div');
          div.className = 'confirmacion-text-export';
          div.textContent = ta.value || ta.textContent || '';
          ta.parentNode.insertBefore(div, ta);
          replacements.push({ original: ta, replacement: div });
          ta.style.display = 'none';
        });

        // Tamaño base carta (ancho fijo). Altura según contenido para evitar áreas vacías
        const width = 816;
        const height = element.scrollHeight || element.offsetHeight || 1056;

        const opt = {
          margin: 0,
          image: { type: 'jpg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
          },
          jsPDF: {
            unit: 'px',
            format: [width, height],
            orientation: 'portrait'
          }
        };

        // eslint-disable-next-line no-await-in-loop
        const pdfBlob = await html2pdf().set(opt).from(element).output('blob');
        pdfBlobs.push(pdfBlob);

        // Restaurar inputs/textarea
        replacements.forEach(({ original, replacement }) => {
          original.style.display = '';
          replacement.remove();
        });
      }

      // Combinar páginas (forzando 1 página por captura para evitar páginas en blanco)
      const mergedPdf = await PDFDocument.create();
      // eslint-disable-next-line no-restricted-syntax
      for (const blob of pdfBlobs) {
        // eslint-disable-next-line no-await-in-loop
        const bytes = await blob.arrayBuffer();
        // eslint-disable-next-line no-await-in-loop
        const src = await PDFDocument.load(bytes);
        const indices = src.getPageIndices();
        // Solo copiar la primera página de cada blob para evitar páginas vacías adicionales
        // eslint-disable-next-line no-await-in-loop
        const [page] = await mergedPdf.copyPages(src, [indices[0] || 0]);
        mergedPdf.addPage(page);
      }

      const mergedBytes = await mergedPdf.save();
      const downloadBlob = new Blob([mergedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(downloadBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `confirmacion-reserva-${cotizacionData?.cliente?.nombre || 'documento'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showNotification('PDF descargado correctamente', 'success');
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      showNotification('Error al generar PDF', 'error');
    } finally {
      // Restaurar UI
      hiddenElements.forEach(({ node, display }) => {
        node.style.display = display;
      });
      const page2 = document.querySelector('.confirmacion-page');
      if (page2) page2.className = page2.className.replace('confirmacion-export', '').trim();
      setCurrentPageIndex(originalIndex);
      setLoadingPdf(false);
    }
  };

  // Función para traducir texto dentro de HTML (igual que Portada)
  const replaceTextInHTML = async (html, sourceLanguage, targetLanguage, translateInstance) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    const walker = document.createTreeWalker(
      tempDiv,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          if (parent.tagName === 'I' || parent.classList.contains('pi')) {
            return NodeFilter.FILTER_REJECT;
          }
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
    // eslint-disable-next-line no-cond-assign
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }

    // Función para verificar si un texto necesita traducción
    const shouldTranslate = (text) => {
      // No traducir si es muy corto
      if (text.length <= 2) return false;
      
      // No traducir si son solo números, fechas o caracteres especiales
      if (/^[\d\s\-\/\.\:]+$/.test(text)) return false;
      
      // No traducir si son solo símbolos o caracteres especiales
      if (/^[^\w\s]+$/.test(text)) return false;
      
      // No traducir URLs, emails, teléfonos
      if (/^(https?:\/\/|www\.|@|\+?\d+[\s\-\(\)]*\d+)/.test(text)) return false;
      
      return true;
    };

    // Traducir cada nodo de texto
    // eslint-disable-next-line no-restricted-syntax
    for (const textNode of textNodes) {
      const originalText = textNode.textContent.trim();
      if (originalText && shouldTranslate(originalText)) {
        try {
          // eslint-disable-next-line no-await-in-loop
          const translatedResult = await translateInstance.execute(
            originalText,
            targetLanguage,
            sourceLanguage
          );
          if (
            translatedResult &&
            translatedResult.translatedText &&
            typeof translatedResult.translatedText === 'string'
          ) {
            textNode.textContent = translatedResult.translatedText;
          }
        } catch (error) {
          // Mantener el texto original si hay error en la traducción
        }
      }
    }
    return tempDiv.innerHTML;
  };

  const handleTranslateAndDownload = async () => {
    setLoadingTranslate(true);
    const originalIndex = currentPageIndex;
    const total = 1 + editablePages.length;
    const hiddenElements = [];

    const hideElement = (selector) => {
      const nodes = document.querySelectorAll(selector);
      nodes.forEach((n) => {
        hiddenElements.push({ node: n, display: n.style.display });
        n.style.display = 'none';
      });
    };

    try {
      // Ocultar controles e iconos
      hideElement('.confirmacion-editor-header');
      hideElement('.confirmacion-controls');
      hideElement('.confirmacion-pages-indicator');
      hideElement('.titulo-action-btn');

      const pdfBlobs = [];

      // Procesar cada página individualmente
      for (let i = 0; i < total; i++) {
        
        // Crear HTML de la página específica manualmente
        let pageHTML = '';
        
        if (i === 0) {
          // Página 1: Confirmación de reserva (fija)
          pageHTML = `
            <div class="confirmacion-page-content">
              <div class="confirmacion-header-principal">
                <div class="confirmacion-logo-container">
                  <img src="/logo_grande.png" alt="Logo" class="confirmacion-logo" />
                </div>
                <div class="confirmacion-titulo-container">
                  <h2>${(cotizacionData?.estado && cotizacionData.estado.trim() === 'Cotización enviada') ? `Cotización para ${cotizacionData?.cliente?.nombre || ''}` : 'Confirmación de Reserva'}</h2>
                </div>
                <div class="confirmacion-estado-container">
                  <div class="estado-label">Estado del booking</div>
                  <div class="estado-value">${cotizacionData?.estado ? (cotizacionData.estado.trim() === 'Finalizado' ? 'Confirmado' : cotizacionData.estado.trim() === 'Cotización enviada' ? 'Cotizando' : cotizacionData.estado) : ''}</div>
                </div>
              </div>
              
              <div class="confirmacion-info-section">
                <div class="confirmacion-info-column">
                  <div class="info-row">
                    <span class="info-label">Nombre:</span>
                    <span class="info-value">${cotizacionData?.cliente?.nombre || ''}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Origen:</span>
                    <span class="info-value">${cotizacionData?.agencia || ''}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Fecha de Inicio del servicio:</span>
                    <span class="info-value">${cotizacionData?.fechaViaje ? formatFecha(new Date(cotizacionData.fechaViaje)) : ''}</span>
                  </div>
                </div>
                <div class="confirmacion-info-column">
                  <div class="info-row">
                    <span class="info-label">Booking por:</span>
                    <span class="info-value">${cotizacionData?.creadoPor?.nombre || cotizacionData?.creadoPor?.username || ''}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Whatsapp:</span>
                    <span class="info-value">${cotizacionData?.cliente?.whatsapp || ''}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Correo:</span>
                    <span class="info-value">${cotizacionData?.creadoPor?.email || ''}</span>
                  </div>
                </div>
              </div>
              
              <div class="confirmacion-pasajeros">
                <h4>${cotizacionData?.nroPax || 1} Pasajero${(cotizacionData?.nroPax || 1) > 1 ? 's' : ''}</h4>
                <ul>
                  ${cotizacionData?.pasajeros && cotizacionData.pasajeros.length > 0 
                    ? cotizacionData.pasajeros.map(pasajero => `<li>${pasajero.nombre}</li>`).join('')
                    : Array.from({ length: cotizacionData?.nroPax || 1 }, (_, idx) => 
                        `<li>Nombre del pasajero ${idx + 1}</li>`).join('')
                  }
                </ul>
              </div>
              
              <div class="confirmacion-itinerario">
                <h4>Itinerario</h4>
                <table>
                  <thead>
                    <tr>
                      <th>DÍA</th>
                      <th>FECHA</th>
                      <th>SERVICIOS/ACTIVIDADES</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${getItinerario().map(item => `
                      <tr>
                        <td>${item.dia}</td>
                        <td>${item.fecha}</td>
                        <td>${item.actividad}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
            <div class="confirmacion-page-footer">
              <div class="footer-item">
                <i class="pi pi-map-marker"></i>
                <span>Calle Garcilaso - Nro 265 / Oficina 10 - Segundo Piso. Cusco Perú</span>
              </div>
              <div class="footer-item">
                <i class="pi pi-whatsapp"></i>
                <span>+51 912 920 103</span>
              </div>
            </div>
          `;
        } else {
          // Páginas editables
          const editablePage = editablePages[i - 1];
          if (!editablePage) continue;
          
          pageHTML = `
            <div class="confirmacion-page-content">
              <div class="confirmacion-logo-container">
                <img src="/logo_grande.png" alt="Logo" class="confirmacion-logo" />
              </div>
              ${editablePage.blocks.map(block => {
                if (block.type === 'row') {
                  return `
                    <div class="confirmacion-block-row">
                      <div class="confirmacion-title-export">${block.titulo}</div>
                      <div class="confirmacion-text-export">${block.contenido}</div>
                    </div>
                  `;
                } else if (block.type === 'double') {
                  return `
                    <div class="confirmacion-block-double">
                      <div class="confirmacion-block-column">
                        <div class="confirmacion-title-export">${block.col1.titulo}</div>
                        <div class="confirmacion-text-export">${block.col1.contenido}</div>
                      </div>
                      <div class="confirmacion-block-column">
                        <div class="confirmacion-title-export">${block.col2.titulo}</div>
                        <div class="confirmacion-text-export">${block.col2.contenido}</div>
                      </div>
                    </div>
                  `;
                }
                return '';
              }).join('')}
            </div>
            <div class="confirmacion-page-footer">
              <div class="footer-item">
                <i class="pi pi-map-marker"></i>
                <span>Calle Garcilaso - Nro 265 / Oficina 10 - Segundo Piso. Cusco Perú</span>
              </div>
              <div class="footer-item">
                <i class="pi pi-whatsapp"></i>
                <span>+51 912 920 103</span>
              </div>
            </div>
          `;
        }

        // Crear elemento temporal para la traducción
        const tempDiv = document.createElement('div');
        tempDiv.className = 'confirmacion-page confirmacion-export';
        tempDiv.innerHTML = pageHTML;
        document.body.appendChild(tempDiv);


        // Traducir el HTML de la página
        // eslint-disable-next-line no-await-in-loop
        const translatedHTML = await replaceTextInHTML(
          tempDiv.innerHTML,
          idiomaOrigen,
          idiomaDestino,
          translate
        );
        tempDiv.innerHTML = translatedHTML;

        // Esperar a que se aplique la traducción
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 300));

        // Generar PDF de esta página específica
        const width = 816;
        const height = tempDiv.scrollHeight || tempDiv.offsetHeight || 1056;

        const opt = {
          margin: 0,
          image: { type: 'jpg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
          },
          jsPDF: {
            unit: 'px',
            format: [width, height],
            orientation: 'portrait'
          }
        };

        // eslint-disable-next-line no-await-in-loop
        const pdfBlob = await html2pdf().set(opt).from(tempDiv).output('blob');
        pdfBlobs.push(pdfBlob);

        // Limpiar elemento temporal
        document.body.removeChild(tempDiv);
      }

      // Combinar PDFs
      const mergedPdf = await PDFDocument.create();
      
      // eslint-disable-next-line no-restricted-syntax
      for (let idx = 0; idx < pdfBlobs.length; idx++) {
        const blob = pdfBlobs[idx];
        // eslint-disable-next-line no-await-in-loop
        const bytes = await blob.arrayBuffer();
        // eslint-disable-next-line no-await-in-loop
        const src = await PDFDocument.load(bytes);
        const indices = src.getPageIndices();
        
        // Solo copiar la primera página de cada blob
        // eslint-disable-next-line no-await-in-loop
        const [pageCopied] = await mergedPdf.copyPages(src, [indices[0] || 0]);
        mergedPdf.addPage(pageCopied);
      }

      const mergedBytes = await mergedPdf.save();
      const downloadBlob = new Blob([mergedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(downloadBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `confirmacion-${idiomaDestino}-${cotizacionData?.cliente?.nombre || 'documento'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showNotification('PDF traducido descargado correctamente', 'success');
    } catch (error) {
      console.error('Error al traducir y generar PDF:', error);
      showNotification('Error al traducir y generar PDF', 'error');
    } finally {
      // Restaurar UI
      hiddenElements.forEach(({ node, display }) => {
        node.style.display = display;
      });
      
      // Limpiar clases de exportación
      const page2 = document.querySelector('.confirmacion-page');
      if (page2) page2.className = page2.className.replace('confirmacion-export', '').trim();
      
      setCurrentPageIndex(originalIndex);
      setRenderKey(prev => prev + 1);
      setLoadingTranslate(false);
    }
  };

  const openTemplateModal = (blockId, column = null) => {
    setCurrentBlockId(blockId);
    setCurrentColumn(column);
    setShowTemplateModal(true);
  };

  const closeTemplateModal = () => {
    setShowTemplateModal(false);
    setCurrentBlockId(null);
    setCurrentColumn(null);
  };

  const handleTemplateSelected = (template) => {
    if (!currentBlockId) return;
    
    const updatedPages = [...editablePages];
    const block = updatedPages[currentPageIndex - 1].blocks.find(b => b.id === currentBlockId);
    
    if (block) {
      if (currentColumn) {
        // Para bloques dobles
        block[currentColumn].titulo = template.templateTitle || '';
        block[currentColumn].contenido = template.description || '';
      } else {
        // Para bloques simples
        block.titulo = template.templateTitle || '';
        block.contenido = template.description || '';
      }
      setEditablePages(updatedPages);
      showNotification('Plantilla cargada correctamente', 'success');
    }
    
    closeTemplateModal();
  };

  if (loadingData || !cotizacionData) {
    return (
      <div className="confirmacion-loading">
        <ProgressSpinner />
        <p>Cargando confirmación de reserva...</p>
      </div>
    );
  }

  const totalPages = 1 + editablePages.length;
  const isFirstPage = currentPageIndex === 0;
  const currentEditablePage = !isFirstPage ? editablePages[currentPageIndex - 1] : null;

  return (
    <div className="confirmacion-editor-container">
      {/* Header con controles */}
      <div className="confirmacion-editor-header">
        <Button
          label="Descargar pdf"
          icon="pi pi-file-pdf"
          className="p-button-outlined"
          size="small"
          onClick={handleDownloadPdf}
          loading={loadingPdf}
          disabled={loadingPdf || loadingTranslate}
        />
        
        <div className="confirmacion-language-selector">
          <label className="language-label">Idioma origen</label>
          <Dropdown
            value={idiomaOrigen}
            options={idiomas}
            onChange={(e) => setIdiomaOrigen(e.value)}
            className="language-dropdown"
            disabled={loadingTranslate}
          />
        </div>
        
        <div className="confirmacion-language-selector">
          <label className="language-label">Idioma destino</label>
          <Dropdown
            value={idiomaDestino}
            options={idiomas}
            onChange={(e) => setIdiomaDestino(e.value)}
            className="language-dropdown"
            disabled={loadingTranslate}
          />
        </div>
        
        <Button
          label="Traducir y descargar pdf"
          icon="pi pi-globe"
          className="p-button-info"
          size="small"
          onClick={handleTranslateAndDownload}
          loading={loadingTranslate}
          disabled={loadingPdf || loadingTranslate}
        />
        
        <Button
          label="Guardar"
          icon="pi pi-save"
          size="small"
          onClick={handleSave}
          loading={loading}
          disabled={loading}
          className="confirmacion-guardar-btn"
        />
      </div>

      {/* Página actual */}
      <div key={renderKey} className="confirmacion-page">
        {/* Contenido */}
        <div className="confirmacion-page-content">
          {isFirstPage ? (
            /* PÁGINA 1: Confirmación de Reserva con datos */
            <>
              {/* Header con logo, título y estado en una sola fila */}
              <div className="confirmacion-header-principal">
                <div className="confirmacion-logo-container">
                  <img src="/logo_grande.png" alt="Logo" className="confirmacion-logo" />
                </div>
                <div className="confirmacion-titulo-container">
                  <h2>{isCotizacionEnviada(cotizacionData?.estado) ? `Cotización para ${cotizacionData?.cliente?.nombre || ''}` : 'Confirmación de Reserva'}</h2>
                </div>
                <div className="confirmacion-estado-container">
                  <div className="estado-label">Estado del booking</div>
                  <div className="estado-value">{getEstadoBooking(cotizacionData?.estado)}</div>
                </div>
              </div>

              {/* Información principal en dos columnas */}
              <div className="confirmacion-info-section">
                <div className="confirmacion-info-column">
                  <div className="info-row">
                    <span className="info-label">Nombre:</span>
                    <span className="info-value">{cotizacionData?.cliente?.nombre || ''}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Origen:</span>
                    <span className="info-value">{cotizacionData?.agencia || ''}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Fecha de Inicio del servicio:</span>
                    <span className="info-value">{cotizacionData?.fechaViaje ? formatFecha(new Date(cotizacionData.fechaViaje)) : ''}</span>
                  </div>
                </div>
                <div className="confirmacion-info-column">
                  <div className="info-row">
                    <span className="info-label">Booking por:</span>
                    <span className="info-value">{cotizacionData?.creadoPor?.nombre || cotizacionData?.creadoPor?.username || ''}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Whatsapp:</span>
                    <span className="info-value">{cotizacionData?.cliente?.whatsapp || ''}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Correo:</span>
                    <span className="info-value">{cotizacionData?.creadoPor?.email || ''}</span>
                  </div>
                </div>
              </div>

              {/* Pasajeros */}
              <div className="confirmacion-pasajeros">
                <h4>{cotizacionData?.nroPax || 1} Pasajero{(cotizacionData?.nroPax || 1) > 1 ? 's' : ''}</h4>
                <ul>
                  {cotizacionData?.pasajeros && cotizacionData.pasajeros.length > 0 ? (
                    cotizacionData.pasajeros.map((pasajero, i) => (
                      <li key={i}>{pasajero.nombre}</li>
                    ))
                  ) : (
                    Array.from({ length: cotizacionData?.nroPax || 1 }, (_, i) => (
                      <li key={i}>Nombre del pasajero {i + 1}</li>
                    ))
                  )}
                </ul>
              </div>

              {/* Itinerario */}
              <div className="confirmacion-itinerario">
                <h4>Itinerario</h4>
                <DataTable value={getItinerario()} size="small" emptyMessage="Sin itinerario">
                  <Column 
                    field="dia" 
                    header="DÍA" 
                    style={{ width: '10%' }}
                    body={(rowData) => <span data-label="DÍA">{rowData.dia}</span>}
                  />
                  <Column 
                    field="fecha" 
                    header="FECHA" 
                    style={{ width: '25%' }}
                    body={(rowData) => <span data-label="FECHA">{rowData.fecha}</span>}
                  />
                  <Column 
                    field="actividad" 
                    header="SERVICIOS/ACTIVIDADES" 
                    style={{ width: '65%' }}
                    body={(rowData) => <span data-label="SERVICIOS/ACTIVIDADES">{rowData.actividad}</span>}
                  />
                </DataTable>
              </div>
            </>
          ) : (
            /* PÁGINAS EDITABLES con bloques */
            <>
              {/* Logo en páginas editables */}
              <div className="confirmacion-logo-container">
                <img src="/logo_grande.png" alt="Logo" className="confirmacion-logo" />
              </div>
              
              {currentEditablePage && currentEditablePage.blocks.map((block) => (
                <div key={block.id} className="confirmacion-block">
                
                {block.type === 'row' && (
                  <div className="confirmacion-block-row">
                    <div className="confirmacion-titulo-container">
                      <InputText
                        value={block.titulo}
                        onChange={(e) => updateBlock(block.id, 'titulo', e.target.value)}
                        className="confirmacion-titulo-input"
                      />
                      <Button
                        icon="pi pi-database"
                        className="p-button-text p-button-sm titulo-action-btn"
                        onClick={() => openTemplateModal(block.id, null)}
                        tooltip="Cargar desde plantilla"
                        tooltipOptions={{ position: 'top' }}
                      />
                      <Button
                        icon="pi pi-trash"
                        className="p-button-text p-button-danger p-button-sm titulo-action-btn"
                        onClick={() => deleteBlock(block.id)}
                        tooltip="Eliminar bloque"
                        tooltipOptions={{ position: 'top' }}
                      />
                    </div>
                    <InputTextarea
                      value={block.contenido}
                      onChange={(e) => updateBlock(block.id, 'contenido', e.target.value)}
                      className="confirmacion-contenido-input"
                      rows={3}
                      autoResize
                    />
                  </div>
                )}

                {block.type === 'double' && (
                  <div className="confirmacion-block-double">
                    <div className="confirmacion-block-column">
                      <div className="confirmacion-titulo-container">
                        <InputText
                          value={block.col1.titulo}
                          onChange={(e) => updateBlock(block.id, 'titulo', e.target.value, 'col1')}
                          className="confirmacion-titulo-input"
                        />
                        <Button
                          icon="pi pi-database"
                          className="p-button-text p-button-sm titulo-action-btn"
                          onClick={() => openTemplateModal(block.id, 'col1')}
                          tooltip="Cargar desde plantilla"
                          tooltipOptions={{ position: 'top' }}
                        />
                        <Button
                          icon="pi pi-trash"
                          className="p-button-text p-button-danger p-button-sm titulo-action-btn"
                          onClick={() => deleteBlock(block.id)}
                          tooltip="Eliminar bloque"
                          tooltipOptions={{ position: 'top' }}
                        />
                      </div>
                      <InputTextarea
                        value={block.col1.contenido}
                        onChange={(e) => updateBlock(block.id, 'contenido', e.target.value, 'col1')}
                        className="confirmacion-contenido-input"
                        rows={3}
                        autoResize
                      />
                    </div>
                    <div className="confirmacion-block-column">
                      <div className="confirmacion-titulo-container">
                        <InputText
                          value={block.col2.titulo}
                          onChange={(e) => updateBlock(block.id, 'titulo', e.target.value, 'col2')}
                          className="confirmacion-titulo-input"
                        />
                        <Button
                          icon="pi pi-database"
                          className="p-button-text p-button-sm titulo-action-btn"
                          onClick={() => openTemplateModal(block.id, 'col2')}
                          tooltip="Cargar desde plantilla"
                          tooltipOptions={{ position: 'top' }}
                        />
                        <Button
                          icon="pi pi-trash"
                          className="p-button-text p-button-danger p-button-sm titulo-action-btn"
                          onClick={() => deleteBlock(block.id)}
                          tooltip="Eliminar bloque"
                          tooltipOptions={{ position: 'top' }}
                        />
                      </div>
                      <InputTextarea
                        value={block.col2.contenido}
                        onChange={(e) => updateBlock(block.id, 'contenido', e.target.value, 'col2')}
                        className="confirmacion-contenido-input"
                        rows={3}
                        autoResize
                      />
                    </div>
                  </div>
                )}
              </div>
              ))}
            </>
          )}
        </div>

        {/* Footer con dirección y whatsapp */}
        <div className="confirmacion-page-footer">
          <div className="footer-item">
            <i className="pi pi-map-marker" />
            <span>Calle Garcilaso - Nro 265 / Oficina 10 - Segundo Piso. Cusco Perú</span>
          </div>
          <div className="footer-item">
            <i className="pi pi-whatsapp" />
            <span>+51 912 920 103</span>
          </div>
        </div>
      </div>

      {/* Controles en el pie */}
      <div className="confirmacion-controls">
        <Button
          icon="pi pi-file"
          label="Nuevo"
          onClick={addNewPage}
          className="p-button-outlined"
          size="small"
        />
        <Button
          icon="pi pi-th-large"
          label="Fila"
          onClick={addRowBlock}
          className="p-button-outlined"
          size="small"
          disabled={isFirstPage}
        />
        <Button
          icon="pi pi-clone"
          label="Doble"
          onClick={addDoubleBlock}
          className="p-button-outlined"
          size="small"
          disabled={isFirstPage}
        />
        <Button
          icon="pi pi-trash"
          label="Eliminar página"
          onClick={confirmDeletePage}
          className="p-button-outlined p-button-danger"
          size="small"
          disabled={isFirstPage || editablePages.length === 0}
        />
      </div>

      {/* Indicador de páginas */}
      {totalPages > 1 && (
        <div className="confirmacion-pages-indicator">
          {Array.from({ length: totalPages }, (_, index) => (
            <Button
              key={index}
              label={`${index + 1}`}
              onClick={() => setCurrentPageIndex(index)}
              className={index === currentPageIndex ? 'p-button-primary' : 'p-button-outlined'}
              size="small"
            />
          ))}
        </div>
      )}

      {/* Diálogo de confirmación */}
      <ConfirmDialog />

      {/* Modal de plantilla itinerario */}
      {showTemplateModal && (
        <PlantillaItinerarioModal
          onHide={closeTemplateModal}
          onSelectTemplate={handleTemplateSelected}
        />
      )}
    </div>
  );
};

export default ConfirmacionReserva;

