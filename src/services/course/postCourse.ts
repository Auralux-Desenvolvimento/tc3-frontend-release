import axios from "axios";
import ICourseData from "../../utils/types/course/ICourseData";

export default function postCourse (name: string) {
    const preFilteredResponse = axios.post<ICourseData>(
      `${process.env.REACT_APP_API_URL}/course`, 
      name,
      { withCredentials: true }
    );
    return preFilteredResponse;
}