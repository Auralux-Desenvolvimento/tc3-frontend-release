import axios from "axios";

export default function postNewPassword (password: string, token: string) {
  const preFilteredResponse = axios.post(
    `${process.env.REACT_APP_API_URL}/team/password-recovery/new-password/${token}`,
    {password},
    { withCredentials: true }
  );
  return preFilteredResponse;
}