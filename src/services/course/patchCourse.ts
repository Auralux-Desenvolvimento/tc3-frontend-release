import axios from "axios";

export default function patchCourse (id: string, name: string) {
  const preFilteredResponse = axios.patch(
    `${process.env.REACT_APP_API_URL}/course/${id}`,
    {
      name
    },
    {
      params: { id },
      withCredentials: true
    }
  );
  return preFilteredResponse;
}