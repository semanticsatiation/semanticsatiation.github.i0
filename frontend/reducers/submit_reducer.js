import { START_SUBMISSION, END_SUBMISSION } from "../actions/shared_actions";

const defaultState = { 
    isSubmitting: false,
};


function submitReducer(state = defaultState, action) {
    Object.freeze(state);
    switch (action.type) {
        case START_SUBMISSION:
            return Object.assign({}, state, { isSubmitting: true });
        case END_SUBMISSION:
            return Object.assign({}, state, { isSubmitting: false });
        default:
            return state;
    }
}

export default submitReducer;