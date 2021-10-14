import { connect } from "react-redux";
import { withRouter } from "react-router-dom";

// async actions 
import { 
    createBug, updateBug, 
} from "../../../actions/current_project_actions";

// components
import BugForm from "./bug_form";

const mapStateToProps = (state, ownProps) => {
    let defaultBugProperties = {
        title: "",
        description: "",
        priority: "low",
        status: "new",
        severity: "minor",
        expected_result: "",
        actual_result: "",
        environment: "",
        testing_version: "",
        dead_line: "",
        steps: "",
        platform: "",
        url: "",
        components: "",
    };

    const setBuggers = ownProps.isUpdate ? (ownProps.bugProperties.buggers) : (undefined);
    const setPhotos = ownProps.isUpdate ? (ownProps.bugProperties.photos) : ([]);

    if (ownProps.isUpdate) {
        const {photos, close_date, created_at, updated_at, submitter, buggers, ...filterBugProperties} = ownProps.bugProperties;
        defaultBugProperties = Object.assign({}, defaultBugProperties, filterBugProperties);
    }
    
    return {
        currentProjectId: state.currentProject.details.id,
        projectIdIsValid: state.entities.projects.byId.hasOwnProperty(ownProps.match.params.projectId),
        errors: state.errors.formErrors,
        isSubmitting: state.ui.submit.isSubmitting,
        currentOrganizationId: state.session.currentOrganizationId,
        buggers: setBuggers,
        photos: setPhotos,
        bugProperties: defaultBugProperties,
    }
};

const mapDispatchToProps = (dispatch) => ({
    createBug: (formOpt) => dispatch(createBug(formOpt)),
    updateBug: (formOpt) => dispatch(updateBug(formOpt)),
    deleteBug: (formOpt) => dispatch(deleteBug(formOpt)),

});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(BugForm));