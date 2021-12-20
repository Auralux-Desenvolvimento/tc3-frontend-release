export default interface ILocationData {
  id: string;
  state: string;
  cities: {
    id: string;
    name: string;
  }[];
}