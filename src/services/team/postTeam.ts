import axios from "axios";
import IMemberData from "../../utils/types/member/IMemberData";
import IAdvisorData from "../../utils/types/advisor/IAdvisorData";
import IUserTeamData from "../../utils/types/team/IUserTeamData";

export interface IPostTeamParams {
  name: string;
  logoURL?: string;
  email: string;
  password: string;
  course: string;
  city: string;
  theme?: string;
  members: IMemberData[];
  advisors: IAdvisorData[];
  keywords: string[];
}

export default function postTeam (postData: IPostTeamParams) {
  const preFilteredResponse = axios.post<IUserTeamData>(
    `${process.env.REACT_APP_API_URL}/team`,
    postData,
    { withCredentials: true }
  );
  return preFilteredResponse;
}