import * as SharedUtil from "../util/shared_util";
import { clearFormErrors, receiveFormErrors } from "./form_actions";
import { CREATE_OBJECT, DELETE_OBJECT, sharedActions, UPDATE_OBJECT } from "./shared_actions";
import { 
    endExtraLayerObjectsFetch,
    failExtraLayerObjectsFetch, failExtraObjectsFetch, failObjectsFetch, 
    startFetchingExtraLayerObjects, startFetchingExtraObjects, startFetchingObjects 
} from "./fetching_actions";
import { NEW_RECORD, UPDATE_RECORD } from "../components/shared/variables";


export const RECEIVE_CURRENT_BUG = "RECEIVE_CURRENT_BUG";
export const REMOVE_CURRENT_BUG = "REMOVE_CURRENT_BUG";
export const RECEIVE_BUG_ACTIVITIES = "RECEIVE_BUG_ACTIVITIES";
export const RECEIVE_EXTRA_BUG_COMMENTS = "RECEIVE_EXTRA_BUG_COMMENTS";
export const RECEIVE_EXTRA_NESTED_BUG_COMMENTS = "RECEIVE_EXTRA_NESTED_BUG_COMMENTS";
export const RECEIVE_BUG_COMMENT = "RECEIVE_BUG_COMMENT";
export const REMOVE_BUG_COMMENT = "REMOVE_BUG_COMMENT";

export const receiveCurrentBug = (currentBug) => ({
    type: RECEIVE_CURRENT_BUG,
    currentBug: currentBug,
});

export const removeCurrentBug = () => ({
    type: REMOVE_CURRENT_BUG
});

export const receiveBugComment = (comment, commentType, recordType) => ({
    type: RECEIVE_BUG_COMMENT,
    comment: comment,
    commentType: commentType,
    recordType: recordType
});

export const removeBugComment = (deletedCommentOptions, commentType) => ({
    type: REMOVE_BUG_COMMENT,
    comment: deletedCommentOptions,
    commentType: commentType
});

export const receiveExtraBugComments = (comments, recalibrate) => ({
    type: RECEIVE_EXTRA_BUG_COMMENTS,
    comments: comments,
    recalibrate: recalibrate
});

export const receiveNestedBugComments = (comments, parentId, recalibrate) => ({
    type: RECEIVE_EXTRA_NESTED_BUG_COMMENTS,
    comments: comments,
    parentId: parentId,
    recalibrate: recalibrate
});

export const receiveBugActivities = (bugActivities) => ({
    type: RECEIVE_BUG_ACTIVITIES,
    bugActivities: bugActivities
});

// async actions
export const fetchFullBug = (formOpt) => (dispatch) => {
    dispatch(startFetchingObjects());
    return SharedUtil.filterObjects(formOpt).then(
        (successfulBug) => dispatch(receiveCurrentBug(successfulBug)),
        (errors) => {
            if (!errors.aborted || errors.timedOut) {
                dispatch(failObjectsFetch());
            }
        }
    )
};

export const fetchBugActivities = (formOpt) => (dispatch) => {
    dispatch(startFetchingExtraObjects());

    return SharedUtil.filterObjects(formOpt).then(
        (successfulBugActivitiesFetch) => dispatch(receiveBugActivities(successfulBugActivitiesFetch)),
        (errors) => {
            if (!errors.aborted || errors.timedOut) {
                dispatch(failExtraObjectsFetch());
            }
        }
    )
};

export const createBugComment = (formOpt) => (dispatch) => (
    sharedActions(CREATE_OBJECT, formOpt, dispatch,
        (successfulBugComment) => {
            dispatch(clearFormErrors());

            if (!formOpt.isValidate) {
                dispatch(receiveBugComment(successfulBugComment, formOpt.commentType, NEW_RECORD));
            }
        },
        (errors) => {
            dispatch(receiveFormErrors(errors));
        }
    )
);

export const updateBugComment = (formOpt) => (dispatch) => (
    sharedActions(UPDATE_OBJECT, formOpt, dispatch,
        (successfulBugComment) => {
            dispatch(clearFormErrors());

            if (!formOpt.isValidate) {
                dispatch(receiveBugComment(successfulBugComment, formOpt.commentType, UPDATE_RECORD));
            }
        },
        (errors) => {
            dispatch(receiveFormErrors(errors));
        }
    )
);

export const deleteBugComment = (formOpt) => (dispatch) => (
    sharedActions(DELETE_OBJECT, formOpt, dispatch,
        (successfulDeleteObj) => {
            dispatch(clearFormErrors());

            dispatch(removeBugComment({...successfulDeleteObj, parentId: formOpt.parentId}, formOpt.commentType));
        },
        (errors) => {
            dispatch(receiveFormErrors(errors));
        }
    )
);

export const fetchExtraBugComments = (formOpt) => (dispatch) => {
    dispatch(startFetchingExtraLayerObjects());

    return SharedUtil.filterObjects(formOpt).then(
        (successfulBugActivitiesFetch) => dispatch(receiveExtraBugComments(successfulBugActivitiesFetch, formOpt.recalibrate)),
        (errors) => {

            if (!errors.aborted || errors.timedOut) {
                dispatch(failExtraLayerObjectsFetch());
            } else {
                dispatch(endExtraLayerObjectsFetch());
            }

            throw errors;
        }
    )
};

export const fetchNestedBugComments = (formOpt) => (dispatch) => {
    dispatch(startFetchingExtraLayerObjects());

    return SharedUtil.filterObjects(formOpt).then(
        (successfulBugActivitiesFetch) => dispatch(receiveNestedBugComments(successfulBugActivitiesFetch, formOpt.parentId, formOpt.recalibrate)),
        (errors) => {
            if (!errors.aborted || errors.timedOut) {
                dispatch(failExtraLayerObjectsFetch());
            }
        }
    )
};

