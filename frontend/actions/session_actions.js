import {endAllRequests} from "../util/shared_util";
import { logOutWithTimeout } from "../util/session_util";

// actions
import { receiveFormErrors, clearFormErrors } from "./form_actions";
import { sharedActions, CREATE_OBJECT, UPDATE_OBJECT } from "./shared_actions";


export const RECEIVE_USER = "RECEIVE_USER";
export const LOGOUT_CURRENT_USER = "LOGOUT_CURRENT_USER";
export const START_LOGGING_OUT_CURRENT_USER = "START_LOGGING_OUT_CURRENT_USER";
export const FAIL_LOGOUT_CURRENT_USER = "FAIL_LOGOUT_CURRENT_USER";

export const RECEIVE_CURRENT_ORGANIZATION = "RECEIVE_CURRENT_ORGANIZATION";
export const RECEIVE_HEADER_FORMAT = "RECEIVE_HEADER_FORMAT";

const receiveUser = (user) => ({
    type: RECEIVE_USER,
    user: user
});

export const receiveCurrentOrganization = (organizationId) => ({
    type: RECEIVE_CURRENT_ORGANIZATION,
    organizationId: organizationId
});

const startLoggingOutUser = () => ({
    type: START_LOGGING_OUT_CURRENT_USER
});

export const logOutCurrentUser = () => ({
    type: LOGOUT_CURRENT_USER
});

const failLogOutCurrentUser = () => ({
    type: FAIL_LOGOUT_CURRENT_USER
});




// I would put this in the state of app but any time i update the state
// of app.jsx, everything gets thrown in an infinite loop
export const receiveHeaderFormat = (boolean) => ({
    type: RECEIVE_HEADER_FORMAT,
    boolean: boolean
});


export const signup = (formOpt) => (dispatch) => (
    sharedActions(CREATE_OBJECT, formOpt, dispatch,
        (successfulUser) => {
            if (!formOpt.isValidate) {
                dispatch(receiveCurrentOrganization(successfulUser.currentOrganizationId));
                dispatch(receiveUser(successfulUser.user));
            }
            
            dispatch(clearFormErrors());
        },
        (errors) => {
            dispatch(receiveFormErrors(errors));
        }
    )
);

export const login = (formOpt) => (dispatch) => (
    sharedActions(CREATE_OBJECT, formOpt, dispatch,
        (successfulUser) => {
            dispatch(receiveCurrentOrganization(successfulUser.currentOrganizationId));
            dispatch(receiveUser(successfulUser.user));
            dispatch(clearFormErrors());
        },
        (errors) => {
            dispatch(receiveFormErrors(errors));
        }
    )
);

export const logOut = () => (dispatch) => {
    dispatch(startLoggingOutUser());

    endAllRequests();
    
    logOutWithTimeout().then(
        () => dispatch(logOutCurrentUser()),
        () => {
            dispatch(failLogOutCurrentUser());
            console.log("User has failed to log out!");
        }
    );
};

export const updateUser = (formOpt) => (dispatch) => (
    sharedActions(UPDATE_OBJECT, formOpt, dispatch,
        (successfulUser) => {
            if (!formOpt.isValidate) {
                dispatch(receiveUser(successfulUser));
            }

            dispatch(clearFormErrors());
        },
        (errors) => {
            dispatch(receiveFormErrors(errors));
            
            if (!formOpt.isValidate) {
                throw errors;
            }
        }
    )
);

export const deleteUser = (formOpt) => (dispatch) => {
    dispatch(startLoggingOutUser());

    SharedUtil.endLastGetRequest();
    SharedUtil.endLastFetchRequest();
    endLastStackedFetch();

    return SharedUtil.deleteObject(formOpt).then(
        dispatch(logOutCurrentUser())
    );
};