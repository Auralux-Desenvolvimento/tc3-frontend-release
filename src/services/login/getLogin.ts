import axios from 'axios';
import isModerator from '../../utils/functions/isModerator';
import IUserTeamData from '../../utils/types/team/IUserTeamData';

export default async function getLogin () {
  const preFilteredResponse = await axios.get<IUserTeamData>(
    `${process.env.REACT_APP_API_URL}/login`,
    { withCredentials: true }
  );
  if (!isModerator(preFilteredResponse.data)) {
    preFilteredResponse.data.members = preFilteredResponse.data.members.map(e => {
      e.birthday = new Date(e.birthday);
      return e;
    });
  }
  
  return preFilteredResponse;
}