import { 
    START_FETCHING_PROJECTS, START_FETCHING_EXTRA_PROJECTS, START_FETCHING_OBJECTS, 
    START_FETCHING_EXTRA_OBJECTS, START_FETCHING_CURRENT_PROJECT, FAIL_ORGANIZATIONS_FETCH,
    FAIL_PROJECTS_FETCH, FAIL_EXTRA_PROJECTS_FETCH, START_FETCHING_ORGANIZATIONS, 
    END_FETCHING_EXTRA_PROJECTS, END_FETCHING_EXTRA_OBJECTS, FAIL_CURRENT_PROJECT_FETCH,
    END_FETCHING_OBJECTS, FAIL_OBJECTS_FETCH, FAIL_EXTRA_OBJECTS_FETCH, 
    START_FETCHING_EXTRA_LAYER_OBJECTS, FAIL_EXTRA_LAYER_OBJECTS_FETCH, END_FETCHING_PROJECTS,

} from "../actions/fetching_actions";
import { RECEIVE_PROJECTS, RECEIVE_EXTRA_PROJECTS } from "../actions/project_actions";
import { 
    RECEIVE_CURRENT_PROJECT, RECEIVE_EXTRA_PEOPLE, RECEIVE_PEOPLE, 
    REMOVE_CURRENT_PROJECT, RECEIVE_BUGS, RECEIVE_EXTRA_BUGS, RECEIVE_YEARS, 
    RECEIVE_EXTRA_YEARS, RECEIVE_MONTH_PAGE
} from "../actions/current_project_actions";
import { FAIL_LOGOUT_CURRENT_USER, LOGOUT_CURRENT_USER, START_LOGGING_OUT_CURRENT_USER } from "../actions/session_actions";
import { RECEIVE_ORGANIZATIONS } from "../actions/organization_actions";
import { 
    RECEIVE_BUG_ACTIVITIES, RECEIVE_CURRENT_BUG, RECEIVE_EXTRA_BUG_COMMENTS, 
    RECEIVE_EXTRA_NESTED_BUG_COMMENTS, REMOVE_CURRENT_BUG 
} from "../actions/current_bug_actions";
import { RECEIVE_NOTIFICATIONS } from "../actions/notification_actions";

const defaultState = {
    currentProjectBeingFetched: false,
    extraProjectsBeingFetched: false,
    objectsBeingFetched: false,
    extraObjectsBeingFetched: false,
    extraLayerObjectsBeingFetched: false,

    organizationsFetchFailed: false,
    currentProjectFetchFailed: false,

    projectsBeingFetched: false,
    projectsFetchFailed: false,
    extraProjectsFetchFailed: false,

    objectsFetchFailed: false,
    extraObjectsFetchFailed: false,
    extraLayerObjectsFetchFailed: false,

    loggingOut: false
}

// SERIOUS:
// THERE HAS TO BE A WAY TO COMBINE SOME REDUCERS BELOW FOR INSTANCE:
// WHEN WE GET RECEIVE_CURRENT_ORGANIZATION, IT SHOULD TAKE
// START_FETCHING_EXTRA_PROJECTS, START_FETCHING_CURRENT_PROJECT, START_FETCHING_PROJECTS, ETC...
// INTO ACCOUNT BECAUSE WHEN WE DISPATCH RECEIVE_CURRENT_ORGANIZATION, THIS IS TELLING US THAT
// THE USER CHANGED THE ORGANIZATIONS MEANING WE SHOULD ALSO SAFELY ASSUME THAT
// WE CAN STOP ALL FETCHES THAT WERE OCCURRING FOR THE OLD NEW ORGANIZATION SO MAYBE LIKE SO: 
// case START_FETCHING_ORGANIZATIONS:
// return Object.assign({}, state, { organizationsFetchFailed: false });


function fetchingReducer(state = defaultState, action) {
    Object.freeze(state);
    switch (action.type) {
        case START_FETCHING_ORGANIZATIONS:
            return Object.assign({}, state, { organizationsFetchFailed: false });
        case START_FETCHING_PROJECTS:
            return Object.assign({}, state, { projectsBeingFetched: true, projectsFetchFailed: false });
        case START_FETCHING_CURRENT_PROJECT:
            return Object.assign({}, state, { currentProjectBeingFetched: true, currentProjectFetchFailed: false });
        case START_FETCHING_EXTRA_PROJECTS:
            return Object.assign({}, state, { extraProjectsBeingFetched: true, extraProjectsFetchFailed: false });
        case START_FETCHING_OBJECTS:
            return Object.assign({}, state, { objectsBeingFetched: true, objectsFetchFailed: false, extraObjectsFetchFailed: false });
        case START_FETCHING_EXTRA_OBJECTS:
            return Object.assign({}, state, { extraObjectsBeingFetched: true, extraObjectsFetchFailed: false });
        case START_FETCHING_EXTRA_LAYER_OBJECTS:
            return Object.assign({}, state, { extraLayerObjectsBeingFetched: true, extraLayerObjectsFetchFailed: false });

        case FAIL_CURRENT_PROJECT_FETCH:
            return Object.assign({}, state, { currentProjectBeingFetched: false, currentProjectFetchFailed: true }); 
        case FAIL_ORGANIZATIONS_FETCH: 
            return Object.assign({}, state, { organizationsFetchFailed: true });
        case FAIL_PROJECTS_FETCH:
            return Object.assign({}, state, { projectsBeingFetched: false, projectsFetchFailed: true });
        case FAIL_EXTRA_PROJECTS_FETCH:
            return Object.assign({}, state, { extraProjectsBeingFetched: false, extraProjectsFetchFailed: true });
        case END_FETCHING_PROJECTS:
            return Object.assign({}, state, { projectsBeingFetched: false, projectsFetchFailed: false });
        case END_FETCHING_EXTRA_PROJECTS:
            return Object.assign({}, state, { extraProjectsBeingFetched: false, extraProjectsFetchFailed: false });


        case FAIL_OBJECTS_FETCH:
            return Object.assign({}, state, { objectsBeingFetched: false, objectsFetchFailed: true });
        case FAIL_EXTRA_OBJECTS_FETCH:
            return Object.assign({}, state, { extraObjectsBeingFetched: false, extraObjectsFetchFailed: true });
        case FAIL_EXTRA_LAYER_OBJECTS_FETCH:
            return Object.assign({}, state, { extraLayerObjectsBeingFetched: false, extraLayerObjectsFetchFailed: true });

        case END_FETCHING_OBJECTS:
            return Object.assign({}, state, { objectsBeingFetched: false, extraObjectsFetchFailed: false });
        case END_FETCHING_EXTRA_OBJECTS:
            return Object.assign({}, state, { extraObjectsBeingFetched: false, extraObjectsFetchFailed: false });


        case RECEIVE_ORGANIZATIONS: 
            return Object.assign({}, state, { organizationsFetchFailed: false });
        case RECEIVE_EXTRA_BUG_COMMENTS:
        case RECEIVE_EXTRA_NESTED_BUG_COMMENTS:
            return Object.assign({}, state, {
                extraLayerObjectsBeingFetched: false, extraLayerObjectsFetchFailed: false
            });
        case RECEIVE_PEOPLE:
        case RECEIVE_BUGS:
        case RECEIVE_YEARS:
        case RECEIVE_NOTIFICATIONS:
            return Object.assign({}, state, { 
                objectsBeingFetched: false, extraObjectsFetchFailed: false,
                extraLayerObjectsBeingFetched: false, extraLayerObjectsFetchFailed: false
            });

        case RECEIVE_BUG_ACTIVITIES:
        case RECEIVE_EXTRA_YEARS:
        case RECEIVE_EXTRA_PEOPLE:
        case RECEIVE_EXTRA_BUGS:
            return Object.assign({}, state, { extraObjectsBeingFetched: false });
        case RECEIVE_MONTH_PAGE:
            return Object.assign({}, state, { extraLayerObjectsBeingFetched: false });
        case RECEIVE_PROJECTS:
            return Object.assign({}, state, { projectsBeingFetched: false, extraProjectsFetchFailed: false });
        case RECEIVE_EXTRA_PROJECTS:
            return Object.assign({}, state, { extraProjectsBeingFetched: false });
        case RECEIVE_CURRENT_PROJECT: 
        case REMOVE_CURRENT_PROJECT:
            return Object.assign({}, state, { currentProjectBeingFetched: false, currentProjectFetchFailed: false });

        case START_LOGGING_OUT_CURRENT_USER:
            return Object.assign({}, defaultState, { loggingOut: true });
        case FAIL_LOGOUT_CURRENT_USER:
            return Object.assign({}, state, { loggingOut: false });
        case RECEIVE_CURRENT_BUG:
        case REMOVE_CURRENT_BUG:
        case LOGOUT_CURRENT_USER:
            return defaultState;
        default:
            return state;
    }
}

export default fetchingReducer;