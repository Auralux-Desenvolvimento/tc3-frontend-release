import { createContext } from "react";
import UseState from "./types/UseState";

export interface IAlert {
  title: string;
  message: string;
}

export default createContext<UseState<IAlert|undefined>>([
  undefined,
  () => {}
]);