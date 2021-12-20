import { createContext } from "react";
import UseState from "./types/UseState";

export default createContext<UseState<number>>([
  0,
  () => {}
]);