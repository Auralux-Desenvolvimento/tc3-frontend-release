import { FC } from 'react';
import Modal from 'react-responsive-modal';
import UseState from '../../../utils/types/UseState';
import "react-responsive-modal/styles.css";
import PreferencesForm from '../../PreferencesForm';
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';
import './style.css';

interface props {
  openState: UseState<boolean>;
  handleSubmit(): Promise<void>;
  buttonText: string;
}

const FilterModal: FC<props> = ({
  openState,
  handleSubmit,
  buttonText
}) => {
  const [ open, setOpen ] = openState;

  return (
    <Modal 
      classNames={{
        modal: "filter-modal",
        closeIcon: "close-icon-modal"
      }} 
      open={open} 
      onClose={()=>{setOpen(false)}} 
      focusTrapped={false} 
      center
    >
      <SimpleBar className="preferences-wrapper">
        <PreferencesForm
          labelLocal="Selecione a localização das equipes que você tem interesse:"
          labelTheme="Você está buscando equipes que já possuem um tema?"
          labelCourse="Selecione quais os cursos que você tem interesse:"
          button={buttonText}
          onSubmit={handleSubmit}
        />
      </SimpleBar>
    </Modal>
  )
}

export default FilterModal;