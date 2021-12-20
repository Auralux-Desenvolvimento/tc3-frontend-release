import { FC } from 'react';
import UseState from '../../../utils/types/UseState';
import '../EditProfile/style.css';
import Password from './InnerPages/Password';
import TabModal, { ITab } from '../TabModal';
import Name from './InnerPages/Name';

interface props {
  openState: UseState<boolean>;
}

export interface IEditProfileModeratorFormValues {
  password: string;
}

const EditProfileModerator: FC<props> = ({
  openState,
}) => {
  const tabs: ITab[] = [
    {
      name: "Nome",
      content: Name
    },
    {
      name: "Senha",
      content: Password
    },
  ];

  return (
    <TabModal className="edit-profile" openState={openState} tabs={tabs} />
  );
}

export default EditProfileModerator;