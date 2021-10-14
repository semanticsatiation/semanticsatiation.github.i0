import { combineReducers } from "redux";

// reducers
import entitiesReducer from "./entities_reducer";
import sessionReducer from "./session_reducer";
import errorsReducer from "./errors_reducer";
import currentProjectReducer from "./current_project_reducer";
import currentBugReducer from "./current_bug_reducer";
import uiReducer from "./ui_reducer";

import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

// persist only the session and entities
const persistConfig = {
    key: 'root',
    storage,
    whitelist: ["session", "entities"]
}

const rootReducer = combineReducers({
    entities: entitiesReducer,
    session: sessionReducer,
    errors: errorsReducer,
    ui: uiReducer,
    currentProject: currentProjectReducer,
    currentBug: currentBugReducer
});

export default persistReducer(persistConfig, rootReducer);