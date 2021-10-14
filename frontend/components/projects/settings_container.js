import { connect } from "react-redux";

// actions
import { deleteProject, fetchExtraProjects, leaveProject } from "../../actions/project_actions";

// components
import Settings from "./settings";

const mapStateToProps = (state, ownProps) => {
    const { session, currentProject, errors, entities} = state;

    return {
        errors: errors.formErrors,
        currentOrganizationId: session.currentOrganizationId,
        currentProject: currentProject.details,
        isOwnerViewing: currentProject.details.ownerId === session.id,
        currentUserId: session.id,
        projectPage: session.projectPage,
        projectsFilter: entities.projects.filterByName,
        sortBy: entities.projects.sortBy,
        toBeSorted: entities.projects.toBeSorted,
    }
};

const mapDispatchToProps = (dispatch) => ({
    deleteProject: (formOpt) => dispatch(deleteProject(formOpt)),
    leaveProject: (formOpt) => dispatch(leaveProject(formOpt)),
    fetchExtraProjects: (formOpt) => dispatch(fetchExtraProjects(formOpt)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Settings);