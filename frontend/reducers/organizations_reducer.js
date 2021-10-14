import { RECEIVE_ORGANIZATIONS, RECEIVE_ORGANIZATION, REMOVE_ORGANIZATION } from "../actions/organization_actions";
import { LOGOUT_CURRENT_USER } from "../actions/session_actions";

import { cloneDeep } from 'lodash';

// for some reason i can't do const defaultState = { byId: {}, allIds: [] } here
// because it seems that it gets modified somehow...
// i don't know where or how it's getting accessed.

// figured it out, it's because i need a deep copy of the object since 
// i am using functions that affect the default state directly

const defaultState = { byId: {}, allIds: [] };

function OrganizationsReducer(state = defaultState, action) {
    Object.freeze(state);
    switch (action.type) {
        case RECEIVE_ORGANIZATIONS:
            return action.organizations;
        case RECEIVE_ORGANIZATION:
            const updatedState = cloneDeep(state);

            if (!updatedState.byId[action.organization.id]) {
                updatedState.allIds.push(action.organization.id);
            }

            updatedState.byId[action.organization.id] = action.organization;

            return updatedState;
        case REMOVE_ORGANIZATION:
            const stateCopy = cloneDeep(state);

            delete stateCopy.byId[action.organizationId];

            stateCopy.allIds = stateCopy.allIds.filter((id) => id != action.organizationId);

            return stateCopy;
        case LOGOUT_CURRENT_USER:
            return defaultState
        default:
            return state;
    }
}

export default OrganizationsReducer;