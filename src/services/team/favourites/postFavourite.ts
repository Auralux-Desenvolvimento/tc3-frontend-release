import axios from "axios";

export default function postFavourite (id: string) {
  const preFilteredResponse = axios.post(
    `${process.env.REACT_APP_API_URL}/team/${id}/favourite`,
    { id },
    { withCredentials: true }
  );
  return preFilteredResponse;
}