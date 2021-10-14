import { connect } from "react-redux";

// components
import Activities from "./activities"

// actions
import { fetchYears, fetchExtraYears, fetchMonthPage } from "../../../actions/current_project_actions";
const mapStateToProps = (state, ownProps) => {
    const currentProject = state.currentProject;
    const ui = state.ui;

    return ({
        currentProjectId: currentProject.details.id,
        totalSessionYears: currentProject.activities.allIds.length,
        totalYears: currentProject.activities.totalYears,
        byId: currentProject.activities.byId,
        allIds: currentProject.activities.allIds,
        yearsBeingFetched: ui.fetching.objectsBeingFetched,
        extraYearsBeingFetched: ui.fetching.extraObjectsBeingFetched,
        activitiesFetchFailed: ui.fetching.objectsFetchFailed,
        extraActivitiesFetchFailed: ui.fetching.extraObjectsFetchFailed,
        monthBeingFetched: ui.fetching.extraLayerObjectsBeingFetched,
        monthFetchFailed: ui.fetching.extraLayerObjectsFetchFailed,
    });
};

const mapDispatchToProps = (dispatch) => ({
    fetchYears: (formOpt) => dispatch(fetchYears(formOpt)),
    fetchExtraYears: (formOpt) => dispatch(fetchExtraYears(formOpt)),
    fetchMonthPage: (formOpt) => dispatch(fetchMonthPage(formOpt)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Activities);