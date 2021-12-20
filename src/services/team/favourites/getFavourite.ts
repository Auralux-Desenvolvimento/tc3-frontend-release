import axios from 'axios';
import IListItemTeamWithId from '../../../utils/types/team/IListItemTeamWithId';

export interface IGetFavouriteResponse extends IListItemTeamWithId {
  isFavourite?: boolean;
}

export default async function getFavourite () {
  const preFilteredResponse = await axios.get<IGetFavouriteResponse[]>(
    `${process.env.REACT_APP_API_URL}/team/favourite`,
    { 
      withCredentials: true,
    }
  );
  return preFilteredResponse;
}