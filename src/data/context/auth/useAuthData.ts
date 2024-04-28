import { useContext } from "react";

import AuthContext from "./AuthContext";

const useAuthData = () => useContext(AuthContext);

export default useAuthData;
