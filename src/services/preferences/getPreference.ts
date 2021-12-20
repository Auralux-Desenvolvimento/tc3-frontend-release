import axios from 'axios';

export interface IGetPreferenceResponse {
  area?: string;
  themePreference?: boolean;
  courses: string[];
  keywords?: string[];
}

export default async function getPreference () {
  const preFilteredResponse = await axios.get<IGetPreferenceResponse>(
    `${process.env.REACT_APP_API_URL}/team/preferences`,
    { 
      withCredentials: true,
    }
  );
  return preFilteredResponse;
}