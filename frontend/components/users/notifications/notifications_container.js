import { connect } from "react-redux";
import { acceptInvite, denyInvite } from "../../../actions/current_project_actions";

// async actions
import { fetchExtraNotifications, fetchNotifications } from "../../../actions/notification_actions";

// components
import Notifications from "./notifications";


const mapStateToProps = (state, ownProps) => {
    const ui = state.ui;
    const notifications = state.entities.notifications.pageNotifications;
    
    return {
        notificationsBeingFetched: ui.fetching.objectsBeingFetched,
        extraNotificationsBeingFetched: ui.fetching.extraObjectsBeingFetched,
        notificationsFetchFailed: ui.fetching.objectsFetchFailed,
        extraNotificationsFetchFailed: ui.fetching.extraObjectsFetchFailed,
        notificationsAllIds: notifications.allIds,
        getNotification: (id) => notifications.byId[id],
        totalNotifications: notifications.totalNotifications,
        totalSessionNotifications: notifications.allIds.length,
        page: notifications.page,
    }
};

const mapDispatchToProps = (dispatch) => ({
    fetchNotifications: (formOpt) => dispatch(fetchNotifications(formOpt)),
    fetchExtraNotifications: (formOpt) => dispatch(fetchExtraNotifications(formOpt)),
    acceptInvite: (formOpt) => dispatch(acceptInvite(formOpt)),
    denyInvite: (formOpt) => dispatch(denyInvite(formOpt))
});

export default connect(mapStateToProps, mapDispatchToProps)(Notifications);