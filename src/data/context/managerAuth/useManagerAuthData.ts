"use client";

import { useContext } from "react";

import ManagerAuthContext, {
  IManagerAuthContext,
} from "./ManagerAuthContext";

const useManagerAuthData = (): IManagerAuthContext =>
  useContext(ManagerAuthContext);

export default useManagerAuthData;
