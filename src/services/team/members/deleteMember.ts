import axios from "axios";

export default function deleteMember (id: string, password: string) {
  const preFilteredResponse = axios.delete(
    `${process.env.REACT_APP_API_URL}/team/members/${id}`,
    {
      withCredentials: true,
      data: {
        password
      }
    }
  );
  return preFilteredResponse;
}  