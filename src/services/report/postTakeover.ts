import axios from "axios";

export default function postTakeover (id: string) {
  const preFilteredResponse = axios.post(
    `${process.env.REACT_APP_API_URL}/report/${id}/takeover`,
    undefined,
    { 
      withCredentials: true
    }
  );
  return preFilteredResponse;
}