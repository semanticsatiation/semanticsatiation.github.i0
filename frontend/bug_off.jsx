import React from "react";
import ReactDOM from "react-dom";

// Store
import configureStore from "./store/store";

// Components
import Root from "./components/root";

// needed for async/await to work
// import "@babel/polyfill";

(document).addEventListener("DOMContentLoaded", () => {
    let store;

    if (window.currentUser) {
        const preloadedState = {
            entities: { 
                users: { [window.currentUser.user.id]: window.currentUser.user },
            },
            session: { 
                id: window.currentUser.user.id, 
                theme: window.currentUser.user.theme,
                currentOrganizationId: window.currentUser.currentOrganizationId
            },
        }
        
        store = configureStore(preloadedState);

        delete window.currentUser;
    } else {
        store = configureStore();
    }

    const root = document.getElementById("root");

    ReactDOM.render(
        <Root store={store}/>, root
    );
});