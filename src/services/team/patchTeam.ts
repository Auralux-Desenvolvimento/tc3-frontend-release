import axios from "axios";
import IMemberData from "../../utils/types/member/IMemberData";

export interface IPatchTeamParams {
  name?: string,
  logoURL?: string|null,
  password: string,
  course?: string,
  city?: string,
  theme?: string|null,
  members?: IMemberData[],
  portfolio?: object|null,
  themeDescription?: string|null
}

export default function patchTeam (patchData: IPatchTeamParams) {
  const preFilteredResponse = axios.patch(
    `${process.env.REACT_APP_API_URL}/team`,
    patchData,
    { withCredentials: true }
  );
  return preFilteredResponse;
}