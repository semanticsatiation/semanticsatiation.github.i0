import { connect } from "react-redux";
import ProjectNav from "./project_nav";

// actions
import { fetchFullProject, removeCurrentProject } from "../../actions/current_project_actions";


const mapStateToProps = (state, ownProps) => {
    const currentProject = state.currentProject;
    const session = state.session;
    const entities = state.entities;
    const ui = state.ui;

    return {
        currentOrganizationId: session.currentOrganizationId,
        projectIds: entities.projects.allIds,
        projectsLength: entities.projects.allIds.length,
        currentProjectBeingFetched: ui.fetching.currentProjectBeingFetched,
        isHeaderStacked: session.headerStacked,
        currentProjectFetchFailed: ui.fetching.currentProjectFetchFailed,
        currentProjectId: currentProject.details.id,
        bugIds: currentProject.bugs.allIds,
        currentProjectOwnerId: currentProject.details.ownerId,
        currentUserId: session.id,
    }
};

const mapDispatchToProps = (dispatch) => ({
    fetchFullProject: (formOpt) => dispatch(fetchFullProject(formOpt)),
    removeCurrentProject: () => dispatch(removeCurrentProject()),
});

export default connect(mapStateToProps, mapDispatchToProps)(ProjectNav);