import axios from 'axios';

export default async function getCountTeams () {
  const preFilteredResponse = await axios.get<number>(
    `${process.env.REACT_APP_API_URL}/team/search/count`,
    { 
      withCredentials: true,
    }
  );
  return preFilteredResponse;
}