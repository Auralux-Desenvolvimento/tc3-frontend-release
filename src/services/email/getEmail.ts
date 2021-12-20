import axios from 'axios';

export default function getEmail (token: string) {
  const preFilteredResponse = axios.get(
    `${process.env.REACT_APP_API_URL}/team/confirm-email/${token}`,
    { withCredentials: true }
  );
  return preFilteredResponse;
}