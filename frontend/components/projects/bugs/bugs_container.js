import { connect } from "react-redux";

// actions
import { filterBugs, fetchExtraBugs } from "../../../actions/current_project_actions";

// components
import Bugs from "./bugs";


const mapStateToProps = (state, ownProps) => {
    const currentProject = state.currentProject;
    const ui = state.ui;

    return ({
        errors: state.errors.formErrors,
        isSubmitting: ui.submit.isSubmitting,
        currentProjectId: currentProject.details.id,
        totalSessionBugs: currentProject.bugs.allIds.length,
        totalBugs: currentProject.bugs.totalBugs,
        bugsAllIds: currentProject.bugs.allIds,
        bugsBeingFetched: ui.fetching.objectsBeingFetched,
        extraBugsBeingFetched: ui.fetching.extraObjectsBeingFetched,
        bugsFetchFailed: ui.fetching.objectsFetchFailed,
        extraBugsFetchFailed: ui.fetching.extraObjectsFetchFailed,
        getBug: (id) => currentProject.bugs.byId[id]
    });
};

const mapDispatchToProps = (dispatch) => ({
    filterBugs: (formOpt) => dispatch(filterBugs(formOpt)),
    fetchExtraBugs: (formOpt) => dispatch(fetchExtraBugs(formOpt))
});

export default connect(mapStateToProps, mapDispatchToProps)(Bugs);