import { useEffect, useState } from "react";
import { useThrottledCallback } from "use-debounce/lib";

export default function useWindowScroll () {
  const [ scroll, setScroll ] = useState<number>(0);
  const throttledSetScroll = useThrottledCallback(innerSetScroll, 150);
  function innerSetScroll () {
    setScroll(window.scrollY);
  }

  useEffect(() => {
    window.addEventListener("scroll", throttledSetScroll);
    return () => {
      window.removeEventListener("scroll", throttledSetScroll);
    }
  }, []);

  return scroll;
}