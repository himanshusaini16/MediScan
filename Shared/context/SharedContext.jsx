import { io } from "socket.io-client";

import { createContext, useEffect, useState } from "react";
export const SharedContext = createContext();


const SharedContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

console.log("backend url from shared context",backendUrl)
const [socket, setSocket] = useState(null);

useEffect(() => {
    const newSocket = io(backendUrl, {
      withCredentials: true,
      transports: ["websocket"],
    });
    setSocket(newSocket);

    return () => newSocket.close();
  }, [backendUrl]);


  const value = {
    socket
  }

   return (
      <SharedContextProvider.Provider value={value}>{props.children}</SharedContextProvider.Provider>
    );

}


export default SharedContextProvider;