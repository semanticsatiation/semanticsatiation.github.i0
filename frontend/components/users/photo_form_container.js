import { connect } from "react-redux";

// Components
import PhotoForm from "./photo_form";

// actions
import { updateUser } from "../../actions/session_actions";


const mapStateToProps = (state, ownProps) => ({
    errors: state.errors.formErrors,
    isSubmitting: state.ui.submit.isSubmitting,
});

const mapDispatchToState = (dispatch) => ({
    submitPhotos: (formOpt) => dispatch(updateUser(formOpt)),
});

export default connect(mapStateToProps, mapDispatchToState)(PhotoForm);