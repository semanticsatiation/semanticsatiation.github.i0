import { connect } from "react-redux";

// actions
import { createProject, receiveProject, updateProject } from "../../actions/project_actions";

// components
import ProjectForm from "./project_form";
import { arrayifyOrganizationsBlockContributed, getCurrentOrganization } from "../../reducers/selectors";
import { receiveCurrentOrganization } from "../../actions/session_actions";


const mapStateToProps = (state, ownProps) => {
    const currentProjectDetails = state.currentProject.details;
    const ui = state.ui;
    
    return {
        organizations: arrayifyOrganizationsBlockContributed(state),
        currentOrganization: getCurrentOrganization(state),
        currentUserId: state.session.id, 
        errors: state.errors.formErrors,
        projectsBeingFetched: ui.fetching.projectsBeingFetched,
        isUpdateForm: ownProps.type === "update",
        isReadForm: ownProps.type === "read",
        project: (["update", "read"].includes(ownProps.type) ? (state.entities.projects.byId[currentProjectDetails.id]) : (undefined)) || {name: "", description: ""},
        projectId: currentProjectDetails.id,
        isSubmitting: ui.submit.isSubmitting,
    }
};

const mapDispatchToProps = (dispatch) => ({
    createProject: (formOpt, isDefaultDispatch) => dispatch(createProject(formOpt, isDefaultDispatch)),
    updateProject: (formOpt) => dispatch(updateProject(formOpt)),
    changeCurrentOrganization: (organizationId) => dispatch(receiveCurrentOrganization(organizationId)),
    receiveProject: (project, recordType) => dispatch(receiveProject(project, recordType))
});

export default connect(mapStateToProps, mapDispatchToProps)(ProjectForm);