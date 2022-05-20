import { START_FETCHING_PROJECTS } from "../actions/fetching_actions";
import { RECEIVE_PROJECT, RECEIVE_PROJECTS, RECEIVE_EXTRA_PROJECTS, REMOVE_PROJECT, RECEIVE_PROJECT_FILTER } from "../actions/project_actions";
import { LOGOUT_CURRENT_USER, RECEIVE_CURRENT_ORGANIZATION } from "../actions/session_actions";
import { RECEIVE_SORT_BY } from "../actions/shared_actions";

// helpers
import { recalibrateSort } from "./reducer_helpers";
import { cloneDeep } from 'lodash';

const defaultState = {
    byId: {},
    allIds: [],
    filterByName: "",
    sortBy: "created",
    totalProjects: 0,
    toBeSorted: []
};

function projectsReducer(state = defaultState, action) {
    Object.freeze(state);
    switch (action.type) {
        case RECEIVE_PROJECTS:
            return Object.assign({}, state, action.projects);
        case RECEIVE_EXTRA_PROJECTS:
            const updateStateSlice = cloneDeep(state);

            if (action.projects.hasOwnProperty("toBeSorted")) {
                // if true, this means we are dealing with projects that are present but
                // aren't in the correct spot in the project list and they have their spot coming up
                // in future extra projects fetches
                updateStateSlice.toBeSorted = action.projects.toBeSorted;
                updateStateSlice.allIds = action.projects.allIds;
            } else {
                updateStateSlice.allIds.push(...action.projects.allIds);
            }

            Object.assign(updateStateSlice.byId, action.projects.byId);

            return updateStateSlice;
        case RECEIVE_PROJECT:
            const updatedState = cloneDeep(state);
            const sortBy = updatedState.sortBy;
            const recordType = action.recordType;
            const projectId = action.project.id;

            if (sortBy === "created" && recordType === "new") {
                updatedState.allIds.unshift(projectId);
            } else if (!updatedState.toBeSorted.includes(projectId) && !updatedState.byId[projectId]) {
                // this condition is only here to prevent selected recent projects from 
                // entering toBeSortedBy multiple times leading to duplicate ids
                recalibrateSort((id) => updatedState.byId[id], updatedState.allIds, action.project, sortBy, updatedState.toBeSorted);
            } else if (recordType === "update") {
                updatedState.allIds.slice(updatedState.allIds.findIndex((id) => id === projectId), 1);
                updatedState.toBeSorted.slice(updatedState.toBeSorted.findIndex((id) => id === projectId), 1);

                recalibrateSort((id) => updatedState.byId[id], updatedState.allIds, action.project, sortBy, updatedState.toBeSorted);
            }

            if (recordType === "new") {
                updatedState.totalProjects += 1;
            }

            updatedState.byId[projectId] = action.project;

            return updatedState;
        case RECEIVE_PROJECT_FILTER:
            return Object.assign({}, state, { filterByName: action.filter });
        case RECEIVE_SORT_BY:
            const sortByState = Object.assign({}, state);

            if (action.sortBy.reducer === "Projects") {
                sortByState.sortBy = action.sortBy.option;
            }

            return sortByState;
        case REMOVE_PROJECT:
            const stateCopy = cloneDeep(state);

            delete stateCopy.byId[action.projectId];

            stateCopy.toBeSorted.splice(stateCopy.toBeSorted.findIndex((id) => id === action.projectId), 1);
            
            stateCopy.allIds.splice(stateCopy.allIds.findIndex((id) => id === action.projectId), 1);

            stateCopy.totalProjects -= 1;

            return stateCopy;
        case START_FETCHING_PROJECTS:
            // can't reset the state fully to default when changing the sort for projects
            // since we'll always head back to {sortBy: "created"}
            return Object.assign({}, defaultState, { sortBy: state.sortBy });
        case LOGOUT_CURRENT_USER:
        case RECEIVE_CURRENT_ORGANIZATION:
            return defaultState;
        default:
            return state;
    }
}

export default projectsReducer;