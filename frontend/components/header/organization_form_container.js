import { connect } from "react-redux";

// components
import OrganizationForm from "./organization_form";


// actions
import { createOrganization, deleteOrganization, updateOrganization } from "../../actions/organization_actions";

// selectors
import { getCurrentOrganization } from "../../reducers/selectors";

const mapStateToProps = (state, ownProps) => {
    const currentOrganization = getCurrentOrganization(state);
    const isUpdate = ownProps.type === "Update";

    return {
        errors: state.errors.formErrors,
        currentUserId: state.session.id,
        isSubmitting: state.ui.submit.isSubmitting,
        currentOrganization: currentOrganization,
        name: isUpdate ? (currentOrganization.name) : (""),
        isUpdate: isUpdate,
        isOwner: currentOrganization.ownerId === state.session.id
    }
};

const mapDispatchToProps = (dispatch) => ({
    updateOrganization: (formOpt) => dispatch(updateOrganization(formOpt)),
    createOrganization: (formOpt) => dispatch(createOrganization(formOpt)),
    deleteOrganization: (formOpt) => dispatch(deleteOrganization(formOpt)) 
});


export default connect(mapStateToProps, mapDispatchToProps)(OrganizationForm);