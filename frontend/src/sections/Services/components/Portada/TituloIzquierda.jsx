import '../../styles/Portada/TituloIzquierda.css';

const TituloIzquierda = ({ service }) => {
    return (
        <>
            <div className="titulo-izquierda">
                <div className="izquierda">
                    <div className='titulo'>
                        Titulo
                    </div>
                    <div className='contenido'>
                        Contenido
                    </div>
                </div>
                <div className="imagen">
                    <i className="pi pi-image icono-imagen"></i>
                </div>
            </div>
        </>
    );
};

export default TituloIzquierda;