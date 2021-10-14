import { connect } from "react-redux";

// components
import People from "./people";

// actions 
import { fetchExtraPeople, filterUsers, inviteUser, removeProjectContributor } from "../../../actions/current_project_actions";

const mapStateToProps = (state, ownProps) => {
    const currentProject = state.currentProject;
    const session = state.session;
    const ui = state.ui;

    return {
        currentProjectId: currentProject.details.id,
        projectOwnerId: currentProject.details.ownerId,
        peopleAllIds: currentProject.people.allIds,
        totalPeople: currentProject.people.totalPeople,
        totalSessionPeople: currentProject.people.allIds.length,
        currentUserId: session.id,
        peopleBeingFetched: ui.fetching.objectsBeingFetched,
        extraPeopleBeingFetched: ui.fetching.extraObjectsBeingFetched,
        peopleFetchFailed: ui.fetching.objectsFetchFailed,
        extraPeopleFetchFailed: ui.fetching.extraObjectsFetchFailed,
        getPerson: (id) => currentProject.people.byId[id],
        toBeSorted: currentProject.people.toBeSorted,
        isSubmitting: ui.submit.isSubmitting,
    }
};

const mapDispatchToProps = (dispatch) => ({
    filterUsers: (formOpt) => dispatch(filterUsers(formOpt)),
    removeProjectContributer: (formOpt) => dispatch(removeProjectContributor(formOpt)),
    fetchExtraPeople: (formOpt) => dispatch(fetchExtraPeople(formOpt)),
    inviteUser: (userId) => dispatch(inviteUser(userId))
});

export default connect(mapStateToProps, mapDispatchToProps)(People);