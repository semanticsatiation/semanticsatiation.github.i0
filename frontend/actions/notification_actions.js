import * as SharedUtil from "../util/shared_util";

import { 
    endExtraObjectsFetch, failExtraObjectsFetch, failObjectsFetch, 
    startFetchingExtraObjects, startFetchingObjects 
} from "./fetching_actions";

export const RECEIVE_NOTIFICATION = "RECEIVE_NOTIFICATION";
export const RECEIVE_NOTIFICATIONS = "RECEIVE_NOTIFICATIONS";
export const RECEIVE_EXTRA_NOTIFICATIONS = "RECEIVE_EXTRA_NOTIFICATIONS";

export const receiveNotification = (notification) => ({
    type: RECEIVE_NOTIFICATION,
    notification: notification
});

const receiveNotifications = (notifications, notificationType) => ({
    type: RECEIVE_NOTIFICATIONS,
    notificationType: notificationType,
    notifications: notifications
});

const receiveExtraNotifications = (notifications) => ({
    type: RECEIVE_EXTRA_NOTIFICATIONS,
    notifications: notifications
});

// async actions
export const fetchNotifications = (formOpt) => (dispatch) => {
    dispatch(startFetchingObjects());
    return SharedUtil.filterObjects(formOpt).then(
        (successfulNotifications) => {
            dispatch(receiveNotifications(successfulNotifications));
        },
        (errors) => {
            if (!errors.aborted || errors.timedOut) {
                dispatch(failObjectsFetch());
                return errors;
            }
        }
    )
};

export const fetchExtraNotifications = (formOpt) => (dispatch) => {
    dispatch(startFetchingExtraObjects());
    return SharedUtil.filterObjects(formOpt).then(
        (successfulNotifications) => {
            dispatch(receiveExtraNotifications(successfulNotifications));
        },
        (errors) => {
            if (!errors.aborted || errors.timedOut) {
                dispatch(failExtraObjectsFetch());
            } else {
                dispatch(endExtraObjectsFetch());
            }
        }
    )
};

export const fetchAppNotifications = (formOpt) => (dispatch) => {
    return SharedUtil.filterObjects(formOpt).then(
        (appNotifications) => {
            dispatch(receiveNotifications(appNotifications, "app"));
        },
        (errors) => console.log(errors)
    )
};