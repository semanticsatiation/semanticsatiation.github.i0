import { connect } from "react-redux";

// components
import Bug from "./bug"

// actions
import { deleteBug } from "../../../actions/current_project_actions";
import { 
    fetchFullBug, fetchBugActivities, removeCurrentBug,
    fetchExtraBugComments, fetchNestedBugComments, createBugComment,
    updateBugComment, deleteBugComment
} from "../../../actions/current_bug_actions";
import { clearFormErrors } from "../../../actions/form_actions";

const mapStateToProps = (state, ownProps) => {
    const { comments, activities, ...filteredBug } = state.currentBug;
    const ui = state.ui;
    const currentProject = state.currentProject.details;


    return ({
        currentProjectId: currentProject.id,
        currentUserId: state.session.id,
        canCurrentUserComment: [filteredBug.submitter.id, currentProject.ownerId, ...filteredBug.buggers.allIds].includes(state.session.id),

        bug: filteredBug,
        bugBeingFetched: ui.fetching.objectsBeingFetched,
        bugFetchFailed: ui.fetching.objectsFetchFailed,

        byActivityId: activities.byId,
        allBugActivitiesIds: activities.allIds,
        bugActivitiesBeingFetched: ui.fetching.extraObjectsBeingFetched,
        bugActivitiesFetchFailed: ui.fetching.extraObjectsFetchFailed,
        totalSessionBugActivities: activities.allIds.length,
        totalBugActivities: activities.totalActivities,


        byCommentsId: comments.byId,
        allBugCommentsIds: comments.allIds,
        extraCommentsBeingFetched: ui.fetching.extraLayerObjectsBeingFetched,
        extraCommentsFetchFailed: ui.fetching.extraLayerObjectsFetchFailed,
        totalSessionBugComments: comments.allIds.length,
        totalBugComments: comments.totalComments,
        commentErrors: state.errors.formErrors.comment
    });
};

const mapDispatchToProps = (dispatch) => ({
    fetchBug: (formOpt) => dispatch(fetchFullBug(formOpt)),
    fetchBugActivities: (formOpt) => dispatch(fetchBugActivities(formOpt)),
    deleteBug: (formOpt) => dispatch(deleteBug(formOpt)),
    removeCurrentBug: () => dispatch(removeCurrentBug()),
    fetchExtraBugComments: (formOpt) => dispatch(fetchExtraBugComments(formOpt)),
    fetchNestedBugComments: (formOpt) => dispatch(fetchNestedBugComments(formOpt)),
    createBugComment: (formOpt) => dispatch(createBugComment(formOpt)),
    updateBugComment: (formOpt) => dispatch(updateBugComment(formOpt)),
    deleteBugComment: (formOpt) => dispatch(deleteBugComment(formOpt)),
    clearFormErrors: () => dispatch(clearFormErrors())
});

export default connect(mapStateToProps, mapDispatchToProps)(Bug);