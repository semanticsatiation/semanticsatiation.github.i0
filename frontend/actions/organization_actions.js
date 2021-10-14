import * as SharedUtil from "../util/shared_util";

// actions
import { receiveFormErrors, clearFormErrors } from "./form_actions";
import { receiveCurrentOrganization } from "./session_actions";
import { sharedActions, CREATE_OBJECT, UPDATE_OBJECT} from "./shared_actions";
import { failOrganizationsFetch, startFetchingOrganizations } from "./fetching_actions";

export const RECEIVE_ORGANIZATIONS = "RECEIVE_ORGANIZATIONS";
export const RECEIVE_ORGANIZATION = "RECEIVE_ORGANIZATION";
export const REMOVE_ORGANIZATIONS = "REMOVE_ORGANIZATIONS";
export const REMOVE_ORGANIZATION = "REMOVE_ORGANIZATION";

export const receiveOrganizations = (organizations) => ({
    type: RECEIVE_ORGANIZATIONS,
    organizations: organizations
});

export const receiveOrganization = (organization) => ({
    type: RECEIVE_ORGANIZATION,
    organization: organization
});

export const removeOrganization = (organizationId) => ({
    type: REMOVE_ORGANIZATION,
    organizationId: organizationId
});

// async actions
export const fetchOrganizations = (formOpt) => (dispatch) => {
    dispatch(startFetchingOrganizations());

    return SharedUtil.filterObjects(formOpt).then(
        (successfulOrganizations) => {
            dispatch(receiveOrganizations(successfulOrganizations));
        },
        (errors) => {
            if (!errors.aborted || errors.timedOut) {
                dispatch(failOrganizationsFetch());
            }
        }
    )
};

export const createOrganization = (formOpt) => (dispatch) => (
    sharedActions(CREATE_OBJECT, formOpt, dispatch,
        (successfulOrganization) => {
            if (!formOpt.isValidate) {
                dispatch(receiveOrganization(successfulOrganization));
                dispatch(receiveCurrentOrganization(successfulOrganization.id));
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

export const updateOrganization = (formOpt) => (dispatch) => (
    sharedActions(UPDATE_OBJECT, formOpt, dispatch,
        (successfulOrganization) => {
            if (!formOpt.isValidate) {
                dispatch(receiveOrganization(successfulOrganization));
            }

            dispatch(clearFormErrors());
        },
        (errors) => {
            dispatch(receiveFormErrors(errors));
        }
    )
);

export const deleteOrganization = (formOpt) => (dispatch, getState) => (
    SharedUtil.deleteObject(formOpt).then(
        (organizationId) => {
            dispatch(receiveCurrentOrganization(getState().entities.organizations.allIds[0]));
            dispatch(removeOrganization(organizationId));
        }
    )
);