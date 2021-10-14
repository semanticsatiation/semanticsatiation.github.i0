import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

// components
import HomePage from "./homepage";

// actions
import { fetchExtraProjects, filterProjects, receiveProject } from "../actions/project_actions";
import { receiveCurrentOrganization } from "../actions/session_actions";

// selectors
import { getCurrentOrganization } from "../reducers/selectors";

const mapStateToProps = (state, ownProps) => {
    const projects = state.entities.projects;
    const fetching = state.ui.fetching;
    const session = state.session;

    return {
        organizations: state.entities.organizations,
        getProject: (id) => projects.byId[id],
        allIds: projects.allIds,
        totalProjects: projects.totalProjects,
        totalSessionProjects: projects.allIds.length,
        currentOrganization: getCurrentOrganization(state),
        projectsFetchFailed: fetching.projectsFetchFailed,
        projectsBeingFetched: fetching.projectsBeingFetched,
        extraProjectsBeingFetched: fetching.extraProjectsBeingFetched,
        extraProjectsFetchFailed: fetching.extraProjectsFetchFailed,
        projectPage: session.projectPage,
        projectsFilter: projects.filterByName,
        recentProjects: session.recentProjects,
        sortBy: projects.sortBy,
        toBeSorted: projects.toBeSorted
    }
};

const mapDispatchToProps = (dispatch) => ({
    receiveProject: (project, recordType) => dispatch(receiveProject(project, recordType)),
    changeOrganization: (id) => dispatch(receiveCurrentOrganization(id)),
    fetchExtraProjects: (formOpt) => dispatch(fetchExtraProjects(formOpt)),
    filterProjects: (formOpt) => dispatch(filterProjects(formOpt)),
});

// using withRouter here to receive callbacks from project_form.jsx
// referring to the following line: let newProject = this.props.location.newProject;
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(HomePage));