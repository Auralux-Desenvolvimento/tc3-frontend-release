import axios from "axios";

export interface IPostModeratorParams {
  email: string;
  name: string;
  password: string;
  key: string;
}

export default function postModerator (postData: IPostModeratorParams) {
  const preFilteredResponse = axios.post(
    `${process.env.REACT_APP_API_URL}/moderator`,
    postData,
    { withCredentials: true }
  );
  return preFilteredResponse;
}