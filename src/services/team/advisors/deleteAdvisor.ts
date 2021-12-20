import axios from "axios";

export default function deleteAdvisor (id: string, password: string) {
  const preFilteredResponse = axios.delete(
    `${process.env.REACT_APP_API_URL}/team/advisors/${id}`,
    {
      withCredentials: true,
      data: {
        password
      }
    }
  );
  return preFilteredResponse;
}  