import axios from "axios";

export default function banTeam (id: string) {
  const preFilteredResponse = axios.delete(
    `${process.env.REACT_APP_API_URL}/team/${id}/ban`,
    {withCredentials: true}
  );
  return preFilteredResponse;
}