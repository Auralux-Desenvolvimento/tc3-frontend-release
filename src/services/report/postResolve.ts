import axios from "axios";

export default function postResolve (id: string) {
  const preFilteredResponse = axios.post(
    `${process.env.REACT_APP_API_URL}/report/${id}/resolve`,
    undefined,
    { 
      withCredentials: true
    }
  );
  return preFilteredResponse;
}