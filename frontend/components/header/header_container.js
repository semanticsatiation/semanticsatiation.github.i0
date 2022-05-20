import Header from "./header";
import { connect } from "react-redux";

// actions
import { updateUser, logOut, receiveHeaderFormat } from "../../actions/session_actions";
import { receiveCurrentOrganization } from "../../actions/session_actions";

import { fetchOrganizations } from "../../actions/organization_actions";



// selectors
import { getCurrentOrganization } from "../../reducers/selectors";

const mapStateToProps = (state, ownProps) => {
    const entities = state.entities;
    const fetching = state.ui.fetching;
    return {
        currentUser: entities.users[state.session.id],
        currentOrganization: getCurrentOrganization(state),
        currentProject: state.currentProject.details,
        currentProjectBeingFetched: fetching.currentProjectBeingFetched,
        currentProjectFetchFailed: fetching.currentProjectFetchFailed,
        organizationsFetchFailed: fetching.organizationsFetchFailed,
        appNotifications: entities.notifications.appNotifications.byId,
        unreadAppNotificationsCount: entities.notifications.appNotifications.unreadAppNotificationsCount,
        loggingOut: fetching.loggingOut,
    }
};

const mapDispatchToProps = (dispatch) => ({
    logOut: () => dispatch(logOut()),
    updateUser: (formOpt) => dispatch(updateUser(formOpt)),
    fetchOrganizations: () => dispatch(fetchOrganizations({ url: "/organizations" })),
    receiveCurrentOrganization: (organizationId) => dispatch(receiveCurrentOrganization(organizationId)),
    updateHeaderFormat: (boolean) => dispatch(receiveHeaderFormat(boolean)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Header);