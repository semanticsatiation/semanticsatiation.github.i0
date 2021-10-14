import { createStore, applyMiddleware } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import thunk from "redux-thunk";
import logger from "redux-logger";
import rootReducer from "../reducers/root_reducer";


const middlewares = [];

if (process.env.NODE_ENV === 'development') {
    middlewares.push(logger)
}

const configureStore = (preloadedState = {}) => createStore(
    rootReducer,
    preloadedState,
    composeWithDevTools(applyMiddleware(thunk, ...middlewares))
    // ORDER OF middleware MATTERS
);


export default configureStore;