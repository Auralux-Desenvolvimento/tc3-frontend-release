import { FC, ImgHTMLAttributes, SyntheticEvent, useEffect, useState } from "react";

interface props extends ImgHTMLAttributes<any> {
  fallback?: string;
}

const Image: FC<props> = ({
  fallback,
  src,
  onError,
  ...rest
}) => {
  const [ innerSrc, setInnerSrc ] = useState(src||fallback);

  useEffect(() => {
    setInnerSrc(src||fallback)
  }, [ src, fallback ]);

  function handleError (error: SyntheticEvent<HTMLImageElement, Event>) {
    setInnerSrc(fallback);
    onError && onError(error);
  }
  
  return <img src={innerSrc} onError={handleError} {...rest} />
}
export default Image;