import { useContext } from "react";

import SocketContext from "./SocketContext";

const useSocketData = () => useContext(SocketContext);

export default useSocketData;
