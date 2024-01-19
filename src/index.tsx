import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import rootReducer from "./reducers";
import reportWebVitals from './reportWebVitals';

const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false })
}) // redux root store 설정
const persistor = persistStore(store) // localStorage 활용을 위한 persist redux 설정

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
