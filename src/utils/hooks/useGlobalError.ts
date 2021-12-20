import { useEffect, useRef, useState } from "react";
import { IErrorContextData } from "../ErrorContext";

export type SetGlobalError = (error: IErrorContextData|undefined, timeout?: number) => void;

export default function useGlobalError (): [ IErrorContextData|undefined, SetGlobalError ] {
  const [ error, setError ] = useState<IErrorContextData>();
  const [ innerTimeout, setInnerTimeout ] = useState<number>();
  const mounted = useRef(false);
  const innerTimeoutId = useRef<number>();

  const autoClose = (timeout: number) => setTimeout(() => {
    setError(undefined);
  }, timeout);

  const setCustomError = (error: IErrorContextData|undefined, timeout?: number) => {
    setInnerTimeout(timeout); 
    setError(error);
  }

  useEffect(() => {
    mounted.current = true;
  
    if (mounted.current && typeof innerTimeoutId.current === "number") {
      clearTimeout(innerTimeoutId.current);
    }

    if (mounted.current && !!error && innerTimeout !== 0) {
      innerTimeoutId.current = autoClose(innerTimeout || 10000) as any;
    }

    return () => {
      mounted.current = false;
      clearTimeout(innerTimeoutId.current);
    }
  }, [ error, innerTimeout ]);

  return [ error, setCustomError ];
}