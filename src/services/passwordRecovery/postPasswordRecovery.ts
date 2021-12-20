import axios from "axios";

export interface IPostPasswordRecoveryParams {    
  email: string;
}

export default function postPasswordRecovery (postData: IPostPasswordRecoveryParams) {
  const preFilteredResponse = axios.post(
    `${process.env.REACT_APP_API_URL}/team/password-recovery`,
    postData,
    { withCredentials: true }
  );
  return preFilteredResponse;
}