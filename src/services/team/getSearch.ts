import axios from 'axios';
import ICompleteTeamData from '../../utils/types/team/ICompleteTeamData';

export interface IGetSearchResponse extends ICompleteTeamData {
  isFavourite?: boolean;
}

export default async function getSearch (page: number) {
  const preFilteredResponse = await axios.get<IGetSearchResponse[]>(
    `${process.env.REACT_APP_API_URL}/team/search`,
    { 
      withCredentials: true,
      params: { page }
    }
  );
  preFilteredResponse.data = preFilteredResponse.data.map(e => {
    e.members = e.members.map(f => {
      f.birthday = new Date(f.birthday);
      return f;
    });
    return e;
  });
  return preFilteredResponse;
}