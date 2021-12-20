import axios from 'axios';
import ICompleteTeamData from '../../utils/types/team/ICompleteTeamData';

export interface IGetTeamByIdResponse extends ICompleteTeamData {
  isFavourite?: boolean;
  isInterested?: boolean;
  isActive?: boolean;
}

export default async function getTeamById (id: string) {
  const preFilteredResponse = await axios.get<IGetTeamByIdResponse>(
    `${process.env.REACT_APP_API_URL}/team/${id}`,
    { 
      withCredentials: true,
    }
  );
  preFilteredResponse.data.members = preFilteredResponse.data.members.map(e => {
    e.birthday = new Date(e.birthday);
    return e;
  })
  return preFilteredResponse;
}