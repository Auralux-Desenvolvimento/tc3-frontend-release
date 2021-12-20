import axios from 'axios';

export interface IGetKeywordResponse {
  id: string;
  name: string;
  similarity: number;
}

export default async function getKeyword (name: string) {
  const preFilteredResponse = await axios.get<IGetKeywordResponse[]>(
    `${process.env.REACT_APP_API_URL}/keyword/search/${name}`,
    { 
      withCredentials: true,
    }
  );
  return preFilteredResponse;
}