import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import "../styles/RecoverPassword.css"
        

const RecoverPassword = () => {
  return (
    <div className='recover-password'>
      <form className="recover-form">
        <div className="p-input-icon-left">
            <i className="pi pi-envelope"/>
            <InputText type="email" placeholder="Correo" className='p-inputtext-sm'/>
        </div>
        <Button label="Recuperar contraseña" size='small'/>
      </form>
    </div>
  );
};

export default RecoverPassword