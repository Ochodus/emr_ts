import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from "redux-persist/lib/storage"
import filter from "./filter"
import subpage from "./subpages"
import loginInfo from "./auth"

const authPersistConfig = {
    key: "auth",
    storage,
    whitelist: ["token", "email", "user_id", "is_valid"]
}

const lastPagePersistConfig = {
    key: "subpages",
    storage,
    whitelist: ["currentSubPage"]
}

const rootReducer = combineReducers({
    filter: filter,
    subpage: persistReducer(lastPagePersistConfig,subpage),
    loginInfo: persistReducer(authPersistConfig, loginInfo)
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>