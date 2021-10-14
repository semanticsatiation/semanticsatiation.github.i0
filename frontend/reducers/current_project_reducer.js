import { cloneDeep } from 'lodash';

import { 
    RECEIVE_CURRENT_PROJECT, REMOVE_CURRENT_PROJECT, RECEIVE_PEOPLE, 
    REMOVE_PERSON, RECEIVE_UPDATED_PROJECT_PORTION, RECEIVE_EXTRA_PEOPLE, 
    RECEIVE_BUGS, RECEIVE_BUG, RECEIVE_EXTRA_BUGS, 
    RECEIVE_YEARS, RECEIVE_EXTRA_YEARS, RECEIVE_PERSON, RECEIVE_MONTH_PAGE, REMOVE_BUG
} from "../actions/current_project_actions";
import { LOGOUT_CURRENT_USER } from "../actions/session_actions";

// variables
import { NEW_RECORD, UPDATE_RECORD } from '../components/shared/variables';

const defaultState = {
    details: {
        id: undefined, 
        name: "Projects",
        description: undefined,
        organizationId: undefined,
        ownerId: undefined,
    },
    bugs: {
        byId: {},
        allIds: [],
        totalBugs: 0
    },
    activities: {
        byId: {},
        allIds: [],
        totalYears: 0,
    },
    people: {
        byId: {},
        allIds: [],
        totalPeople: 0,
    }
};

function CurrentProjectReducer(state = defaultState, action) {
    Object.freeze(state);
    switch (action.type) {
        case RECEIVE_CURRENT_PROJECT:
            return Object.assign({}, defaultState, action.project);
        case RECEIVE_UPDATED_PROJECT_PORTION:
            return Object.assign({}, state, action.data);
        case RECEIVE_PEOPLE:
            return Object.assign({}, state, {people: Object.assign({}, state.people, action.people)});
        case RECEIVE_PERSON:
            const dupPeople = cloneDeep(state.people);

            dupPeople.byId[action.person.id] = action.person;
            dupPeople.allIds.unshift(action.person.id)
            dupPeople.totalPeople += 1

            return Object.assign({}, state, {people: dupPeople});
        case RECEIVE_BUG:
            const updatedBug = cloneDeep(state);

            const bug = action.bug;

            if (action.recordType === NEW_RECORD) {
                updatedBug.bugs.byId[bug.id] = bug;
                updatedBug.bugs.allIds.push(bug.id);
            } else if (action.recordType === UPDATE_RECORD) {
                updatedBug.bugs.byId[bug.id] = bug;
            }

            return updatedBug;
        case REMOVE_BUG: 
            // THIS NEEDS TO BE DONE!!!!!
            return state;
        case RECEIVE_BUGS:
            return Object.assign({}, state, { bugs: Object.assign({}, state.bugs, action.bugs) });
        case RECEIVE_YEARS:
            return Object.assign({}, state, { activities: action.years });
        case RECEIVE_EXTRA_BUGS:
            const updateBugSlice = cloneDeep(state);

            updateBugSlice.bugs.allIds.push(...action.bugs.allIds);

            Object.assign(updateBugSlice.bugs.byId, action.bugs.byId);

            return updateBugSlice;
        case RECEIVE_EXTRA_PEOPLE:
            const updatePeopleSlice = cloneDeep(state);

            if (action.recalibrate) {
                updatePeopleSlice.people.allIds = action.people.allIds;

                Object.assign(updatePeopleSlice.people.byId, action.people.byId);
            } else {
                updatePeopleSlice.people.allIds.push(...action.people.allIds);
            }

            Object.assign(updatePeopleSlice.people.byId, action.people.byId);

            return updatePeopleSlice;
        case RECEIVE_EXTRA_YEARS:
            const years = action.years;

            return {
                ...state,
                activities: {
                    byId: {
                        ...state.activities.byId,
                        ...years.byId
                    },

                    allIds: [...state.activities.allIds,...years.allIds],
                    totalYears: years.totalYears,
                }
            };
        case RECEIVE_MONTH_PAGE:
            const year = action.year;

            const activityMonthState = Object.assign({}, state.activities.byId, {
                [year]: {
                    ...state.activities.byId[year],
                    [action.monthName]: {
                        ...action.month.byId,
                        totalActivities: action.month.totalActivities,
                        allIds: action.month.allIds,
                        monthPage: action.month.monthPage
                    },
                }
            });

            return {
                ...state,
                activities: {
                    ...state.activities,
                    byId: {
                        ...activityMonthState
                    }
                }
            };
        case REMOVE_PERSON:
            let currentState = cloneDeep(state);

            delete currentState.people.byId[action.userId];

            currentState.people.allIds = currentState.people.allIds.filter((id) => id != action.userId);

            currentState.people.totalPeople -= 1;

            return currentState;
        case REMOVE_CURRENT_PROJECT:
        case LOGOUT_CURRENT_USER:
            return defaultState;
        default:
            return state;
    }
};

export default CurrentProjectReducer;