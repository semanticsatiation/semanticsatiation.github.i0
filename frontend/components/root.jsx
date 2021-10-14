import React from "react";
import { Provider } from "react-redux";
import { HashRouter } from "react-router-dom";


import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";

// makes React watchable
import { hot } from "react-hot-loader";

// Components
import AppContainer from "./app_container";

const Root = ({store}) => (
    <Provider store={store}>
        <HashRouter>
            <PersistGate loading={null} persistor={persistStore(store)}>
                <AppContainer/>
            </PersistGate>
        </HashRouter>
    </Provider>
);

export default hot(module)(Root);