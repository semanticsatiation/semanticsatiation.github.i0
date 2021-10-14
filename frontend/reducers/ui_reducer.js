import { combineReducers } from "redux";

// reducers
import fetchingReducer from "./fetching_reducer";
import submitReducer from "./submit_reducer";


const uiReducer = combineReducers({
    fetching: fetchingReducer,
    submit: submitReducer
});

export default uiReducer;