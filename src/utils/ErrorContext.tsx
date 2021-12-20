import { createContext } from "react";

export interface IErrorContextData {
  value: string;
  type?: keyof typeof ErrorContextType;
}

export enum ErrorContextType {
  error = "error",
  warning = "warning",
  success = "success"
}

export default createContext<[ IErrorContextData|undefined, (error: IErrorContextData|undefined, timeout?: number) => void ]>([
  undefined,
  () => {}
]);