import { connect } from "react-redux";

// components
import ProjectsDropDown from "./projects_drop_down";

// selectors
import { arrayifyOrganizations, getCurrentOrganization } from "../../reducers/selectors";

const mapStateToProps = (state, ownProps) => ({
    organizations: arrayifyOrganizations(state),
    getProject: (id) => state.entities.projects.byId[id],
    allIds: state.entities.projects.allIds,
    currentOrganization: getCurrentOrganization(state),
    currentProjectId: state.currentProject.details.id,
    projectsBeingFetched: state.ui.fetching.projectsBeingFetched,
    extraProjectsBeingFetched: state.ui.fetching.extraProjectsBeingFetched,
    projectsFilter: state.entities.projects.filterByName,
});

export default connect(mapStateToProps, null)(ProjectsDropDown);