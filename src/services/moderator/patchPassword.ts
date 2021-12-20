import axios from "axios";

export interface IPatchPasswordParams {
  oldPassword: string;
  newPassword: string;
}

export default function patchPassword (postData: IPatchPasswordParams) {
  const preFilteredResponse = axios.patch(
    `${process.env.REACT_APP_API_URL}/moderator/password`,
    postData,
    { withCredentials: true }
  );
  return preFilteredResponse;
}