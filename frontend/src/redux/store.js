import {combineReducers, configureStore} from '@reduxjs/toolkit'
import userReducer from './authSlice'
import { persistReducer, persistStore } from 'redux-persist';
const customStorage = {
  getItem: (key) => Promise.resolve(window.localStorage.getItem(key)),
  setItem: (key, value) => Promise.resolve(window.localStorage.setItem(key, value)),
  removeItem: (key) => Promise.resolve(window.localStorage.removeItem(key)),
};

const rootReducer = combineReducers({ user: userReducer });

const persistConfig = {
  key: 'root',
  storage: customStorage,
  version: 1,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

 export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);