import { createContext } from "react";
import { IGetSearchResponse } from "../services/team/getSearch";
import UseState from "./types/UseState";

export default createContext<UseState<IGetSearchResponse[]>>([
  [],
  () => {}
]);