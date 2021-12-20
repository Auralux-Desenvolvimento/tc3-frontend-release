import { FC, useState } from 'react';
import Modal from 'react-responsive-modal';
import UseState from '../../../utils/types/UseState';
import "react-responsive-modal/styles.css";
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';
import './style.css';
import "../../../assets/css/genericModal.css"

export interface ITabModalProps extends ITabProps {
  tabs: ITab[];
  className?: string;
}

export interface ITabProps {
  openState: UseState<boolean>;
}

export interface ITab {
  name: string;
  content: FC<ITabProps>;
}

const EditProfile: FC<ITabModalProps> = ({
  openState,
  tabs,
  className
}) => {
  const [ open, setOpen ] = openState;
  const [ currentTab, setCurrentTab ] = useState<ITab>(tabs[0]);

  return (
    <Modal 
      classNames={{ 
        modal: `generic-modal tab-modal ${className ? className : ""}`,
        closeIcon: "close-icon-modal",
        closeButton: "close-modal",
        modalContainer: "generic-modal-container tab-modal-container" 
      }} 
      open={open} 
      onClose={()=>{setOpen(false)}} 
      focusTrapped={false}
    > 
      <header>
        <SimpleBar className="topbar">{tabs.map(e => (
          <div
            className={`item ${e.name === currentTab.name ? "selected" : ""}`}
            onClick={() => setCurrentTab(e)}
            key={e.name}
          >
            <span>{e.name}</span>
          </div>
        ))}</SimpleBar>
      </header>
      <currentTab.content openState={openState} />
    </Modal>
  )
}

export default EditProfile;