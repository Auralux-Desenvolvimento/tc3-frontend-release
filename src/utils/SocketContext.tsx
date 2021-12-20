import { createContext, MutableRefObject } from "react";
import { Socket } from "socket.io-client";

export default createContext<MutableRefObject<Socket|undefined>>({} as MutableRefObject<Socket>);