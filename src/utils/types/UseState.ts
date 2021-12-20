import { Dispatch, SetStateAction } from "react";

type UseState<Type> = [
  Type,
  SetUseState<Type>
];
export default UseState;

export type SetUseState<Type> = Dispatch<SetStateAction<Type>> | ((value: Type) => void);