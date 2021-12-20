import { FC } from 'react';
import UseState from '../../../utils/types/UseState';
import './style.css';
import Team from './InnerPages/Team';
import Theme from './InnerPages/Theme';
import Members from './InnerPages/Members';
import Portfolio from './InnerPages/Portfolio';
import Password from './InnerPages/Password';
import Advisors from './InnerPages/Advisors';
import TabModal, { ITab } from '../TabModal';

interface props {
  openState: UseState<boolean>;
}

export interface IEditProfileFormValues {
  password: string;
}

const EditProfile: FC<props> = ({
  openState,
}) => {
  const tabs: ITab[] = [
    {
      name: "Equipe",
      content: Team
    },
    {
      name: "Integrantes",
      content: Members
    },
    {
      name: "Tema",
      content: Theme
    },
    {
      name: "Portfólio",
      content: Portfolio
    },
    {
      name: "Senha",
      content: Password
    },
    {
      name: "Orientadores",
      content: Advisors
    },
  ];

  return (
    <TabModal className="edit-profile" openState={openState} tabs={tabs} />
  );
}

export default EditProfile;