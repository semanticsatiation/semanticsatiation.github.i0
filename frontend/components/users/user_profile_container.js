import { connect } from "react-redux";

// components
import UserProfile from "./user_profile";

// actions
import { deleteUser } from "../../actions/session_actions";


const mapStateToProps = (state, ownProps) => ({
    currentUser: state.entities.users[state.session.id],
    isSubmitting: state.ui.submit.isSubmitting,
});

const mapDispatchToState = (dispatch) => ({
    deleteUser: (userId) => dispatch(deleteUser(userId))
});

export default connect(mapStateToProps, mapDispatchToState)(UserProfile);