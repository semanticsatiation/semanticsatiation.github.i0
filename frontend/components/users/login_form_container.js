import { connect } from "react-redux";
import SessionForm from "./session_form";

// actions
import { clearFormErrors } from "../../actions/form_actions";
import { login } from "../../actions/session_actions";

const mapStateToProps = (state, ownProps) => ({
    errors: state.errors.formErrors,
    type: "Log In"
});

const mapDispatchToProps = (dispatch) => ({
    submit: (formOpt) => dispatch(login(formOpt)),
    clearFormErrors: () => dispatch(clearFormErrors())
});


export default connect(mapStateToProps, mapDispatchToProps)(SessionForm);