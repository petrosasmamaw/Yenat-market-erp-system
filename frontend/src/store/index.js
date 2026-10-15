import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import authReducer from "./authSlice";
import erpReducer from "./erpSlice";
const store = configureStore({
  reducer: {
    auth: authReducer,
    erp: erpReducer
  }
});
const useAppDispatch = useDispatch;
const useAppSelector = useSelector;
export {
  store,
  useAppDispatch,
  useAppSelector
};
