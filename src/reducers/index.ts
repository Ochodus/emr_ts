import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from "redux-persist/lib/storage"
import filter from "./filter"
import subpage from "./subpages"
import inspection from "./inspection"
import summaryCard from "./summaryCard"
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

const lastInspectionPersistConfig = {
    key: "inspection",
    storage,
    whitelist: ["currentInspection"]
}

const summarySelectionPersistConfig = {
    key: "summary",
    storage,
    whitelist: ["currentSummary"]
}

const rootReducer = combineReducers({
    filter: filter,
    subpage: persistReducer(lastPagePersistConfig, subpage),
    inspection: persistReducer(lastInspectionPersistConfig, inspection),
    summary: persistReducer(summarySelectionPersistConfig, summaryCard),
    loginInfo: persistReducer(authPersistConfig, loginInfo)
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>