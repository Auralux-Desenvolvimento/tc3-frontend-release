import axios from "axios";

export default async function getCountKeys () {
  const preFilteredResponse = await axios.get<number>(
    `${process.env.REACT_APP_API_URL}/moderator/countKeys`,
    {withCredentials: true}
  );
  return preFilteredResponse;
}