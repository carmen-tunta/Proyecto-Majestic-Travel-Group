import { Dropdown } from 'primereact/dropdown';
import '../../styles/Portada/MenuPortada.css';
import { Button } from "primereact/button";
import { TabMenu } from "primereact/tabmenu";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FloatLabel } from 'primereact/floatlabel';
import TituloPortada from './TituloPortada';

const PortadaMenu = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const service = location.state?.service;

    const [activeIndex, setActiveIndex] = useState(0);

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
                outlined
                onClick={() => navigate(-1)} 
            />
            <FloatLabel>
                <Dropdown 
                    id='idiomaOrigen'
                    options={[]} 
                />
                <label htmlFor="idiomaOrigen">Idioma origen</label>
            </FloatLabel>

            <FloatLabel>
                <Dropdown 
                    id='idiomaDestino' 
                    options={[]} 
                />
                <label htmlFor="idiomaDestino">Idioma destino</label>
            </FloatLabel>

            <Button 
                label="Traducir y descargar pdf" 
                icon="pi pi-google"
                
                onClick={() => navigate(-1)} 
            />

            

        </div>
        {activeIndex === 0 && (
                <TituloPortada service={service} />
            )}
            {activeIndex === 1 && (
                <div>
                    Der
                </div>
            )}
            {activeIndex === 2 && (
                <div>
                    Izq
                </div>
            )}
            {activeIndex === 3 && (
                <div>
                    Doble
                </div>
            )}
            {activeIndex === 4 && (
                <div>
                    Contacto
                </div>
            )}
        </>
    );
    };

export default PortadaMenu;
