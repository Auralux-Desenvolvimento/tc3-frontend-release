import axios from 'axios';
import ILocationData from '../../utils/types/location/ILocationData';

export default function getLocation () {
  const preFilteredResponse = axios.get<ILocationData[]>(
    `${process.env.REACT_APP_API_URL}/locations`,
    { withCredentials: true }
  );
  return preFilteredResponse;
}