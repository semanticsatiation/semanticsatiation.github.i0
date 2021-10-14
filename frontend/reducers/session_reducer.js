import { RECEIVE_USER, LOGOUT_CURRENT_USER, RECEIVE_CURRENT_ORGANIZATION, RECEIVE_HEADER_FORMAT } from "../actions/session_actions";
import { RECEIVE_EXTRA_PROJECTS, RECEIVE_PROJECT, RECEIVE_PROJECTS, REMOVE_PROJECT } from "../actions/project_actions";
import { RECEIVE_CURRENT_PROJECT } from "../actions/current_project_actions";

import { cloneDeep } from 'lodash';
import { REMOVE_ORGANIZATION } from "../actions/organization_actions";

const defaultState = {
    id: null,
    theme: "Default",
    currentOrganizationId: null,
    projectPage: 1,
    headerStacked: false,
    recentProjects: []
};

function sessionReducer(state = defaultState, action) {
    Object.freeze(state);
    switch (action.type) {
        case RECEIVE_USER:
            return Object.assign(
                {}, state, { 
                    id: action.user.id, 
                    theme: action.user.theme, 
                }
            );
        case RECEIVE_CURRENT_ORGANIZATION: 
            return Object.assign({}, state, { currentOrganizationId: action.organizationId });
        case RECEIVE_PROJECT:
            const updatedProject = cloneDeep(state);

            if (action.recordType === "update") {
                Object.assign(updatedProject.recentProjects[updatedProject.recentProjects.findIndex((project) => project.id === action.project.id)], action.project)
            }

            return updatedProject;
        case RECEIVE_PROJECTS:
            return Object.assign({}, state, { projectPage: 1 }); 
        case RECEIVE_EXTRA_PROJECTS:
            const extraProjectsState = Object.assign({}, state);

            if (!action.recalibrate) {
                extraProjectsState.projectPage += 1;
            }

            return extraProjectsState;
        case RECEIVE_HEADER_FORMAT:
            return Object.assign({}, state, { headerStacked: action.boolean });
        case RECEIVE_CURRENT_PROJECT:
            const updatedRecent = cloneDeep(state);

            const project = {...action.project.details, ...action.contributedProperties};

            const ind = updatedRecent.recentProjects.findIndex((recentProject) => recentProject.id === project.id);

            if (ind != -1) {
                updatedRecent.recentProjects.splice(ind, 1);
                updatedRecent.recentProjects.unshift(project)
            } else {
                if (updatedRecent.recentProjects.length >= 3) {
                    updatedRecent.recentProjects.pop();
                    updatedRecent.recentProjects.unshift(project);
                } else {
                    updatedRecent.recentProjects.unshift(project);
                }
            }

            return updatedRecent;
        case REMOVE_PROJECT:
            const removeRecent = cloneDeep(state);

            let elementInd = removeRecent.recentProjects.findIndex((project) => project.id === action.projectId);

            // splice is faster than filter since filter creates a new array!
            if (elementInd != -1) {
                removeRecent.recentProjects.splice(elementInd, 1);
            }

            return removeRecent;
        case REMOVE_ORGANIZATION:
            const removeRecents = cloneDeep(state);

            state.recentProjects.forEach((project) => {
                const ind = removeRecents.recentProjects.findIndex((project) => project.organizationId === action.organizationId);
                
                if (ind != -1) {
                    removeRecents.recentProjects.splice(ind, 1);
                }
            });

            return removeRecents;
        case LOGOUT_CURRENT_USER:
            return defaultState;
        default:
            return state;
    }
};

export default sessionReducer;