import { connect } from "react-redux";

// Components
import FormSections from "./form_sections";

// actions
import { updateUser } from "../../actions/session_actions";


const mapStateToProps = (state, ownProps) => ({
    errors: state.errors.formErrors,
});

const mapDispatchToState = (dispatch) => ({
    submit: (formOpt) => dispatch(updateUser(formOpt)),
});

export default connect(mapStateToProps, mapDispatchToState)(FormSections);