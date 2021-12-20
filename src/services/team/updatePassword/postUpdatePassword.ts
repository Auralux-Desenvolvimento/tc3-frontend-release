import axios from "axios";

export interface IPostUpdatePasswordParams {
  oldPassword: string;
  newPassword: string;
}

export default function postUpdatePassword (postData: IPostUpdatePasswordParams) {
  const preFilteredResponse = axios.post(
    `${process.env.REACT_APP_API_URL}/team/update-password`,
    postData,
    { withCredentials: true }
  );
  return preFilteredResponse;
}