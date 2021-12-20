import axios from "axios";

export interface IPatchModeratorParams {
  password: string;
  name: string;
}

export default function patchModerator (postData: IPatchModeratorParams) {
  const preFilteredResponse = axios.patch(
    `${process.env.REACT_APP_API_URL}/moderator`,
    postData,
    { withCredentials: true }
  );
  return preFilteredResponse;
}