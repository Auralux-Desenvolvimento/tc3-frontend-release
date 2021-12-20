import axios from 'axios';
import IListItemTeamWithId from '../../utils/types/team/IListItemTeamWithId';

export interface IGetTeamParams {
  page: number;
  team?: string;
  course?: string;
  city?: string;
}

export default function getTeam (params: IGetTeamParams) {
  const preFilteredResponse = axios.get<IListItemTeamWithId[]>(
    `${process.env.REACT_APP_API_URL}/team`,
    { 
      withCredentials: true,
      params: params
    }
  );
  return preFilteredResponse;
}