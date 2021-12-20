import axios from "axios";

export default async function deletePost (id: string) {
  const preFilteredResponse = await axios.delete(
    `${process.env.REACT_APP_API_URL}/post/${id}`,
    {withCredentials: true}
  );
  return preFilteredResponse;
}