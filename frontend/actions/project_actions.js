import * as SharedUtil from "../util/shared_util";

// actions
import { receiveFormErrors, clearFormErrors } from "./form_actions";
import { 
    startFetchingExtraProjects, failProjectsFetch, failExtraProjectsFetch, 
    startFetchingProjects, endExtraProjectsFetch, endProjectsFetch 
} from "./fetching_actions";
import { receiveUpdatedProjectPortion } from "./current_project_actions";
import { 
    sharedActions, CREATE_OBJECT, receiveSortBy, 
    UPDATE_OBJECT, DELETE_OBJECT 
} from "./shared_actions";

// variables
import { NEW_RECORD, UPDATE_RECORD } from "../components/shared/variables";

export const RECEIVE_PROJECTS = "RECEIVE_PROJECTS";
export const RECEIVE_EXTRA_PROJECTS = "RECEIVE_EXTRA_PROJECTS";
export const RECEIVE_PROJECT = "RECEIVE_PROJECT";
export const REMOVE_PROJECTS = "REMOVE_PROJECTS";
export const REMOVE_PROJECT = "REMOVE_PROJECT";
export const RECEIVE_PROJECT_FILTER = "RECEIVE_PROJECT_FILTER";

export const receiveProject = (project, recordType) => ({
    type: RECEIVE_PROJECT,
    project: project,
    recordType: recordType,
});

export const receiveProjects = (projects) => ({
    type: RECEIVE_PROJECTS,
    projects: projects
});

export const receiveExtraProjects = (projects, recalibrate) => ({
    type: RECEIVE_EXTRA_PROJECTS,
    projects: projects,
    recalibrate: recalibrate
});

export const removeProjects = () => ({
    type: REMOVE_PROJECTS
});

export const removeProject = (projectId) => ({
    type: REMOVE_PROJECT,
    projectId: projectId,
});

export const receiveProjectFilter = (filter) => ({
    type: RECEIVE_PROJECT_FILTER,
    filter: filter
});


// async actions
export const filterProjects = (formOpt) => (dispatch) => {
    dispatch(startFetchingProjects());
    return SharedUtil.filterObjects(formOpt).then(
        (filteredProjects) => {
            dispatch(receiveProjects(filteredProjects));
            dispatch(receiveSortBy({option: formOpt.sortBy, reducer: "Projects"}));
            dispatch(receiveProjectFilter(formOpt.filter));
        },
        (errors) => {
            if (!errors.aborted || errors.timedOut) {
                dispatch(failProjectsFetch());
            } else {
                dispatch(endProjectsFetch());
            }
        }
    )
};

export const fetchExtraProjects = (formOpt) => (dispatch) => {
    // the reason why we have separate cases for FetchingExtraProjects is because
    // the dropdown for projects has a component that relies on startfetchingExtraProjects
    // so if we use startFetchingExtraObjects, which is used by other components, it will also
    // affect the dropdown menu for projects whenever we are fetching extra objects for other components
    // so we need to separate these two cases.
    // P.S.
    // this also applies to filtering projects
    dispatch(startFetchingExtraProjects());

    return SharedUtil.filterObjects(formOpt).then(
        (successfulProjects) => {
            dispatch(receiveExtraProjects(successfulProjects, formOpt.recalibrate));
        },
        (errors) => {
            if (!errors.aborted || errors.timedOut) {
                dispatch(failExtraProjectsFetch());
            } else {
                dispatch(endExtraProjectsFetch());
            }
        }
    )
};

export const createProject = (formOpt, headStraightToProject = false) => (dispatch) => (
    sharedActions(CREATE_OBJECT, formOpt, dispatch,
        (successfulProject) => {
            if (!formOpt.isValidate && headStraightToProject) {
                dispatch(receiveProject(successfulProject, NEW_RECORD));
            }
            
            dispatch(clearFormErrors());

            if (!formOpt.isValidate) {
                return successfulProject;
            }
        },
        (errors) =>{
            dispatch(receiveFormErrors(errors));

            if (!formOpt.isValidate) {
                throw errors;
            }
        }
    )
);

export const updateProject = (formOpt) => (dispatch) => (
    sharedActions(UPDATE_OBJECT, formOpt, dispatch,
        (successfulProject) => {
            if (!formOpt.isValidate) {
                const { id, name, description } = successfulProject.details;
                dispatch(receiveUpdatedProjectPortion(successfulProject));
                dispatch(receiveProject({ id: id, name: name, description: description }, UPDATE_RECORD));
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

export const leaveProject = (formOpt) => (dispatch) => (
    sharedActions(DELETE_OBJECT, formOpt, dispatch,
        (projectId) => dispatch(removeProject(projectId)),
        (errors) => dispatch(removeProject(formOpt.projectId))
    )
);

// on deletion, always remove the project
export const deleteProject = (formOpt) => (dispatch) => (
    sharedActions(DELETE_OBJECT, formOpt, dispatch,
        (projectId) => dispatch(removeProject(projectId)),
        (errors) => dispatch(removeProject(formOpt.projectId))
    )
);