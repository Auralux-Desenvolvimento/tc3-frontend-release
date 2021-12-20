import { ChangeEventHandler } from "react";

export default function stackOnChangeCalls<T> (
  original: ChangeEventHandler<T>,
  newFunction: ChangeEventHandler<T>
): ChangeEventHandler<T> {
  return (event) => {
    newFunction(event);
    original(event);
  }
}