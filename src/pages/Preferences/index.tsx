import { useHistory } from 'react-router-dom';
import PreferencesForm from '../../components/PreferencesForm'
import './style.css'

export default function Preferences() {
  const history = useHistory();
  
  function handleSubmit () {
    history.push("/validar-email");
  }

  return (
    <div className="form-page preferences">
      <PreferencesForm
        h1Title="Preferências"
        labelLocal="Selecione a localização das equipes que você tem interesse:"
        labelTheme="Você está buscando equipes que já possuem um tema?"
        labelCourse="Selecione quais os cursos que você tem interesse:"
        button="Avançar"
        onSubmit={handleSubmit}
      />
    </div>
  )
}