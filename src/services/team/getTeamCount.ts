import axios from 'axios';
import { IGetTeamParams } from './getTeam';

type IGetTeamCountParams = Omit<IGetTeamParams, "page">; 

export default function getTeamCount (params: IGetTeamCountParams) {
  const preFilteredResponse = axios.get<number>(
    `${process.env.REACT_APP_API_URL}/team/count`,
    { 
      withCredentials: true,
      params: params
    }
  );
  return preFilteredResponse;
}