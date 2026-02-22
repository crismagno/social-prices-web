import { useContext } from "react";

import LanguageContext from "./LanguageContext";

const useLanguageData = () => useContext(LanguageContext);

export default useLanguageData;
