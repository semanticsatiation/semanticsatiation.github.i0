import { connect } from "react-redux";

// actions
import { clearFormErrors } from "../../actions/form_actions";

// components
import SubmitButton from "./submit_button";

const mapStateToProps = (state, ownProps) => ({
    inProgress: state.ui.submit.isSubmitting || state.ui.submit.isValidating,
    disableSubmit: ownProps.exposeSubmit ? (false) : (Object.keys(state.errors.formErrors).length > 0 || state.ui.submit.isSubmitting || ownProps.anyEmptyFields)
});

const mapDispatchToProps = (dispatch) => ({
    clearFormErrors: () => dispatch(clearFormErrors()),
});

export default connect(mapStateToProps, mapDispatchToProps)(SubmitButton);