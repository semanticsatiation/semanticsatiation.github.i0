// util
import * as SharedUtil from "../util/shared_util";
import { stackedFetch } from "../util/bug_util";

// variable
import { CONTRIBUTED_PROJECTS, NEW_RECORD, UPDATE_RECORD } from "../components/shared/variables";

// fetch actions
import { 
    endExtraObjectsFetch, failCurrentProjectFetch, failExtraObjectsFetch, 
    failObjectsFetch, startFetchingCurrentProject, startFetchingObjects, 
    startFetchingExtraLayerObjects, endExtraLayerObjectsFetch, failExtraLayerObjectsFetch, 
    startFetchingExtraObjects,
} from "./fetching_actions";

import { removeProject } from "./project_actions";

import {receiveNotification} from "./notification_actions";

import { 
    sharedActions, CREATE_OBJECT, UPDATE_OBJECT,
    DELETE_OBJECT
} from "./shared_actions";

import { clearFormErrors, receiveFormErrors } from "./form_actions";



export const RECEIVE_CURRENT_PROJECT = "RECEIVE_CURRENT_PROJECT";
export const REMOVE_CURRENT_PROJECT = "REMOVE_CURRENT_PROJECT";
export const RECEIVE_UPDATED_PROJECT_PORTION = "RECEIVE_UPDATED_PROJECT_PORTION";


export const RECEIVE_PEOPLE = "RECEIVE_PEOPLE";
export const RECEIVE_EXTRA_PEOPLE = "RECEIVE_EXTRA_PEOPLE";
export const RECEIVE_PERSON = "RECEIVE_PERSON";
export const REMOVE_PERSON = "REMOVE_PERSON";

export const RECEIVE_BUG = "RECEIVE_BUG";
export const RECEIVE_BUGS = "RECEIVE_BUGS";
export const RECEIVE_EXTRA_BUGS = "RECEIVE_EXTRA_BUGS";
export const REMOVE_BUG = "REMOVE_BUG";

export const RECEIVE_YEARS = "RECEIVE_YEARS";
export const RECEIVE_EXTRA_YEARS = "RECEIVE_EXTRA_YEARS";
export const RECEIVE_MONTH_PAGE = "RECEIVE_MONTH_PAGE";

export const receiveCurrentProject = (project, contributedProperties) => ({
    type: RECEIVE_CURRENT_PROJECT,
    project: project,
    contributedProperties: contributedProperties
});

export const removeCurrentProject = () => ({
    type: REMOVE_CURRENT_PROJECT
});



export const receivePeople = (people) => ({
    type: RECEIVE_PEOPLE,
    people: people
});

export const receiveExtraPeople = (people, recalibrate) => ({
    type: RECEIVE_EXTRA_PEOPLE,
    people: people,
    recalibrate: recalibrate
});

export const receivePerson = (person) => ({
    type: RECEIVE_PERSON,
    person: person
});

export const removePerson = (userId) => ({
    type: REMOVE_PERSON,
    userId: userId
});

export const receiveUpdatedProjectPortion = (data) => ({
    type: RECEIVE_UPDATED_PROJECT_PORTION,
    data: data
});



export const receiveBug = (bugs) => ({
    type: RECEIVE_BUG,
    bugs: bugs
});

export const receiveBugs = (bugs) => ({
    type: RECEIVE_BUGS,
    bugs: bugs
});

export const receiveExtraBugs = (bugs) => ({
    type: RECEIVE_EXTRA_BUGS,
    bugs: bugs,
});

export const removeBug = (bugId) => ({
    type: REMOVE_BUG,
    bugId: bugId
});




export const receiveYears = (years) => ({
    type: RECEIVE_YEARS,
    years: years
});

export const receiveExtraYears = (years) => ({
    type: RECEIVE_EXTRA_YEARS,
    years: years,
});

export const receiveMonthPage = (month, monthName, year) => ({
    type: RECEIVE_MONTH_PAGE,
    month: month,
    monthName: monthName,
    year: year
});


// async actions

// current project actions
export const fetchFullProject = (formOpt) => (dispatch, getState) => {
    dispatch(startFetchingCurrentProject());
    return SharedUtil.filterObjects(formOpt).then(
        (successfulProject) => dispatch(receiveCurrentProject(successfulProject, {isContributed: getState().entities.organizations.byId[getState().session.currentOrganizationId].name === CONTRIBUTED_PROJECTS, contributedId: getState().session.currentOrganizationId})),
        (errors) => {
            if (!errors.aborted || errors.timedOut) {
                dispatch(failCurrentProjectFetch());
            }
        }
    )
};

// people actions

export const removeProjectContributor = (formOpt) => (dispatch) => (
    sharedActions(DELETE_OBJECT, formOpt, dispatch,
        (deletedUserId) => dispatch(removePerson(deletedUserId)),
        (errors) => dispatch(receiveFormErrors(errors))
    )
);


export const fetchExtraPeople = (formOpt) => (dispatch) => {
    dispatch(startFetchingExtraObjects());

    return SharedUtil.filterObjects(formOpt).then(
        (successfulPeopleFetch) => dispatch(receiveExtraPeople(successfulPeopleFetch, formOpt.recalibrate)),
        (errors) => {
            if (!errors.aborted || errors.timedOut) {
                dispatch(failExtraObjectsFetch()); 
            } else {
                dispatch(endExtraObjectsFetch());
            }

            throw errors;
        } 
    );
};

export const filterUsers = (formOpt) => (dispatch) => {
    dispatch(startFetchingObjects());

    return SharedUtil.filterObjects(formOpt).then(
        (filteredUsers) => {
            dispatch(receivePeople(filteredUsers));
        },
        (errors) => {
            if (!errors.aborted || errors.timedOut) {
                dispatch(failObjectsFetch());
            }

            throw errors;
        }
    )
};


export const inviteUser = (formOpt) => (dispatch) => (
    sharedActions(CREATE_OBJECT, formOpt, dispatch,
        (successfulUser) => {
            dispatch(clearFormErrors());

            dispatch(receivePerson(successfulUser));
        },
        (errors) => dispatch(receiveFormErrors(errors))
    )
);

export const acceptInvite = (formOpt) => (dispatch) => {
    return SharedUtil.updateObject(formOpt).then(
        (successfulNotification) => {
            dispatch(clearFormErrors());
            dispatch(receiveNotification(successfulNotification));
        },
        (errors) => dispatch(receiveFormErrors(errors))
    )
};

export const denyInvite = (formOpt) => (dispatch) => {
    return SharedUtil.deleteObject(formOpt).then(
        (successfulNotification) => {
            dispatch(clearFormErrors());
            dispatch(receiveNotification(successfulNotification));
        },
        (errors) => dispatch(receiveFormErrors(errors))
    )
};





// bugs action
export const filterBugs = (formOpt) => (dispatch) => {
    dispatch(startFetchingObjects());

    return SharedUtil.filterObjects(formOpt).then(
        (filteredBugs) => {
            dispatch(receiveBugs(filteredBugs));
        },
        (errors) => {
            if (!errors.aborted || errors.timedOut) {
                dispatch(failObjectsFetch());
            }

            throw errors;
        }
    )
};

export const fetchExtraBugs = (formOpt) => (dispatch) => {
    dispatch(startFetchingExtraObjects());

    return SharedUtil.filterObjects(formOpt).then(
        (successfulBugsFetch) => dispatch(receiveExtraBugs(successfulBugsFetch)),
        (errors) => {
            if (!errors.aborted || errors.timedOut) {
                dispatch(failExtraObjectsFetch());
            } else {
                dispatch(endExtraObjectsFetch());
            }

            throw errors;
        }
    );
};

export const createBug = (formOpt) => (dispatch) => (
    sharedActions(CREATE_OBJECT, formOpt, dispatch,
        (successfulBug) => {
            dispatch(clearFormErrors());

            if (!formOpt.isValidate) {
                dispatch(receiveBug(successfulBug, NEW_RECORD));
                return successfulBug;
            }
        },
        (errors) => {
            dispatch(receiveFormErrors(errors));

            if (!formOpt.isValidate) {
                throw errors;
            }
        }
    )
);

export const updateBug = (formOpt) => (dispatch) => (
    sharedActions(UPDATE_OBJECT, formOpt, dispatch,
        (successfulBug) => {
            dispatch(clearFormErrors());

            if (!formOpt.isValidate) {
                const pickedProperties = (({ id, title, status, priority, severity, created_at, isOverdue }) => ({ id, title, status, priority, severity, created_at, isOverdue }))(successfulBug);

                if (successfulBug.close_date) {
                    pickedProperties.close_date = successfulBug.close_date;
                }

                dispatch(receiveBug(pickedProperties, UPDATE_RECORD));

                const {id, isOverdue, ...filterBug} = successfulBug;

                return filterBug;
            }
        },
        (errors) => {
            dispatch(receiveFormErrors(errors));

            if (!formOpt.isValidate) {
                throw errors;
            }
        }
    )
);

export const deleteBug = (formOpt) => (dispatch) => (
    sharedActions(DELETE_OBJECT, formOpt, dispatch,
        (bugId) => {
            dispatch(clearFormErrors());
            dispatch(removeBug(bugId));
        },
        (errors) => dispatch(receiveFormErrors(errors))
    )
);

// activities action
export const fetchYears = (formOpt) => (dispatch) => {
    dispatch(startFetchingObjects());

    return SharedUtil.filterObjects(formOpt).then(
        (successfulYearsFetch) => {
            const { hideMonthsYears, ...filteredProperties } = successfulYearsFetch;

            dispatch(receiveYears(filteredProperties));

            return hideMonthsYears;
        },
        (errors) => {
            if (!errors.aborted || errors.timedOut) {
                dispatch(failObjectsFetch());
            }

            throw errors;
        }
    )
};

export const fetchExtraYears = (formOpt) => (dispatch) => {
    dispatch(startFetchingExtraObjects());

    return SharedUtil.filterObjects(formOpt).then(
        (successfulYearsFetch) => {
            const { hideMonthsYears, ...filteredProperties } = successfulYearsFetch;

            dispatch(receiveExtraYears(filteredProperties));

            return hideMonthsYears;
        },
        (errors) => {
            if (!errors.aborted || errors.timedOut) {
                dispatch(failExtraObjectsFetch());
            } else {
                dispatch(endExtraObjectsFetch());
            }

            throw errors;
        }
    );
};

export const fetchMonthPage = (formOpt) => (dispatch) => {
    dispatch(startFetchingExtraLayerObjects());

    return stackedFetch(formOpt).then(
        (successfulMonthFetch) => dispatch(receiveMonthPage(successfulMonthFetch, formOpt.monthName, formOpt.year)),
        (errors) => {
            if (!errors.aborted || errors.timedOut) {
                dispatch(failExtraLayerObjectsFetch());
            } else {
                dispatch(endExtraLayerObjectsFetch());
            }
        }
    );
};