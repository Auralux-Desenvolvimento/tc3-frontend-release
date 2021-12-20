import axios from 'axios';

export default function getSendEmail () {
  const preFilteredResponse = axios.get(
    `${process.env.REACT_APP_API_URL}/team/confirm-email`,
    { withCredentials: true }
  );
  return preFilteredResponse;
}