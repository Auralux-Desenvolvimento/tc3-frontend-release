import { createContext } from "react";
import IInterest from "./types/interest/IInterest";
import UseState from "./types/UseState";

export default createContext<UseState<IInterest[]>>([
  [],
  () => {}
]);