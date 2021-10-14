import App from "./app";
import { connect } from "react-redux";

// actions 
import { fetchOrganizations } from "../actions/organization_actions";

// maybe pass currentUser to All components so we don't have to keep requiring it???
const mapStateToProps = (state, ownProps) => ({
    theme: state.session.theme,
    organizationsBeingFetched: state.entities.organizations.allIds.length <= 0,
    organizationsFetchFailed: state.ui.fetching.organizationsFetchFailed,
    loggedIn: Boolean(state.session.id),
    appErrors: state.errors.formErrors.app,
    loggingOut: state.ui.fetching.loggingOut
});

const mapDispatchToProps = (dispatch) => ({
    fetchOrganizations: () => dispatch(fetchOrganizations({ url: "/organizations" })),
});
 
export default connect(mapStateToProps, mapDispatchToProps)(App);