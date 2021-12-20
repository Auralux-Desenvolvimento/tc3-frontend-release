import axios from "axios";
import isModerator from "../../utils/functions/isModerator";
import IUserModeratorData from "../../utils/types/moderator/IUserModeratorData";
import IUserTeamData from "../../utils/types/team/IUserTeamData";

export interface IPostLoginParams {
  email: string,
  password: string
}

export default async function postLogin (postData: IPostLoginParams) {
  const preFilteredResponse = await axios.post<IUserTeamData|IUserModeratorData>(
    `${process.env.REACT_APP_API_URL}/login`,
    postData,
    { withCredentials: true }
  );
  if (!isModerator(preFilteredResponse.data)) {
    (preFilteredResponse.data as IUserTeamData).members = (preFilteredResponse.data as IUserTeamData).members.map(e => {
      e.birthday = new Date(e.birthday);
      return e;
    });
  }
  return preFilteredResponse;
}