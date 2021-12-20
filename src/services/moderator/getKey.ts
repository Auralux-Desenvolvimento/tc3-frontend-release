import axios from "axios";

export default async function getKey () {
  const preFilteredResponse = await axios.get<string>(
    `${process.env.REACT_APP_API_URL}/moderator/key`,
    {withCredentials: true}
  );
  return preFilteredResponse;
}