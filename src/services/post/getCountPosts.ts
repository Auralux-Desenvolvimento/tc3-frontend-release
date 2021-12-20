import axios from "axios";

export default async function getCountPosts () {
  const preFilteredResponse = await axios.get<number>(
    `${process.env.REACT_APP_API_URL}/post/count`,
    {withCredentials: true}
  );
  return preFilteredResponse;
}