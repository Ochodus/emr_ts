import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from "redux-persist/lib/storage"
import filter from "./filter"
import loginInfo from "./auth"

const authPersistConfig = {
    key: "auth",
    storage,
    whitelist: ["token", "email", "user_id", "is_valid"]
}


const rootReducer = combineReducers({
    filter: filter,
    loginInfo: persistReducer(authPersistConfig, loginInfo)
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>