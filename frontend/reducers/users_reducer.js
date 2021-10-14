import { RECEIVE_USER, LOGOUT_CURRENT_USER } from "../actions/session_actions";

function usersReducer(state = {}, action) {
    Object.freeze(state);
    switch (action.type) {
        case RECEIVE_USER:
            return {[action.user.id]: action.user};
        case LOGOUT_CURRENT_USER: 
            return {}
        default:
            return state;
    }
};

export default usersReducer;