import { MutableRefObject } from "react";
import getLocation from "../../services/location/getLocation";
import IFormStatus from "../types/IFormStatus";
import ILocationData from "../types/location/ILocationData";


export default function setupLocations (
  mounted: MutableRefObject<boolean | undefined>,
  setLocations: (value: React.SetStateAction<ILocationData[] | undefined>) => void,
  setExternalStatus: (value: React.SetStateAction<IFormStatus | undefined>) => void
) {
  getLocation().then(response => {
    if (mounted.current) {
      response.data.forEach(e => e.cities.sort((a, b) => a.name.localeCompare(b.name)))
      response.data.sort((a, b) => a.state.localeCompare(b.state));
      setLocations(response.data);
    }
  }).catch(() => {
    if (mounted.current) {
      setExternalStatus({
        message: "Oops... Encontramos um erro inesperado, tente novamente mais tarde.",
        state: "error"
      });
    }
  })
}