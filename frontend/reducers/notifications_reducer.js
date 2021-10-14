import { RECEIVE_NOTIFICATIONS, RECEIVE_EXTRA_NOTIFICATIONS, RECEIVE_NOTIFICATION } from "../actions/notification_actions";
import { LOGOUT_CURRENT_USER } from "../actions/session_actions";

// SERIOUS
// appNotifications is here because i wanted to do live notificaztions but I couldn't find any solutions that were 
// up to date.  so i have to try this later on and hope i can figure something out...

const defaultState = {
    pageNotifications: {
        byId: {},
        allIds: [],
        page: 1,
        totalNotifications: 0
    },
    appNotifications: {
        byId: {},
        allIds: [],
        unreadNotificationsCount: 0
    },
};

function notificationsReducer(state = defaultState, action) {
    Object.freeze(state);
    switch (action.type) {
        case RECEIVE_NOTIFICATION:
            return {
                pageNotifications: {
                    byId: {
                        ...state.pageNotifications.byId,
                        [action.notification.id]: action.notification
                    },
                    allIds: state.pageNotifications.allIds

                },
                appNotifications: state.appNotifications
            }
        case RECEIVE_NOTIFICATIONS:
            if (action.notificationType === "app") {
                return {
                    pageNotifications: state.pageNotifications,
                    appNotifications: action.notifications
                }
            } else {
                return {
                    pageNotifications: action.notifications,
                    appNotifications: state.appNotifications
                }
            }
        case RECEIVE_EXTRA_NOTIFICATIONS:
            return {
                pageNotifications: {
                    byId: {
                        ...state.byId,
                        ...action.notifications.byId
                    },
                    allIds: [state.allIds, action.notifications.allIds],
                    page: state.pageNotifications.page + 1
                },
                appNotifications: state.appNotifications
            }
        case LOGOUT_CURRENT_USER:
            return defaultState;
        default:
            return state;
    }
}

export default notificationsReducer;