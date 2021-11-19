import { connect } from "react-redux";
import SessionForm from "./session_form";


// actions
import { signup } from "../../actions/session_actions";

const mapStateToProps = (state, ownProps) => ({
    errors: state.errors.formErrors,
    type: "Sign Up",
});

const mapDispatchToProps = (dispatch) => ({
    submit: (formOpt) => dispatch(signup(formOpt))
});


export default connect(mapStateToProps, mapDispatchToProps)(SessionForm);