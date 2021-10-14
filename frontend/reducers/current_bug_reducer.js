import { 
    RECEIVE_BUG_ACTIVITIES, RECEIVE_BUG_COMMENT, RECEIVE_CURRENT_BUG, RECEIVE_EXTRA_BUG_COMMENTS, 
    RECEIVE_EXTRA_NESTED_BUG_COMMENTS, REMOVE_BUG_COMMENT, REMOVE_CURRENT_BUG 
} from "../actions/current_bug_actions";
import { REMOVE_BUG } from "../actions/current_project_actions";
import { LOGOUT_CURRENT_USER } from "../actions/session_actions";
import { NEW_RECORD } from "../components/shared/variables";

const defaultState = {
    title: "",
    submitter: {},
    created_at: null,
    updated_at: null,
    close_date: null,
    dead_line: null,
    priority: "",
    status: "",
    severity: "",
    description: "",
    steps: "",
    expected_result: "",
    actual_result: "",
    testing_version: "",
    platform: "",
    url: "",
    environment: "",
    components: "",
    photos: [],
    buggers: {
        byId: {},
        allIds: []
    },
    activities: {
        byId: {},
        allIds: [],
        totalActivities: 0
    },
    comments: {
        byId: {},
        allIds: [],
        totalComments: 0
    }
};

function CurrentBugReducer(state = defaultState, action) {
    Object.freeze(state);
    switch (action.type) {
        case RECEIVE_CURRENT_BUG:
            const { buggers, activities, comments, ...keptProperties } = action.currentBug;

            return {
                ...defaultState,
                ...keptProperties,
                buggers: {...defaultState.buggers, ...buggers},
                activities: { ...defaultState.activities, ...activities },
                comments: { ...defaultState.comments, ...comments },
            };
        case RECEIVE_BUG_ACTIVITIES:
            return {
                ...state,
                activities: action.bugActivities
            };
        case RECEIVE_BUG_COMMENT:
            const receiveCommentState = {
                ...state.comments
            }

            const comment = action.comment;
            const commentType = action.commentType;

            if (action.recordType === NEW_RECORD) {
                if (commentType === "parent") {
                    receiveCommentState.byId[comment.id] = comment;
                    receiveCommentState.allIds.push(comment.id);
                    receiveCommentState.totalComments += 1;
                } else if (commentType === "reply") {
                    const replyParent = receiveCommentState.byId[comment.parent_id];

                    if (!replyParent.hasOwnProperty("byId")) {
                        replyParent.byId = {};
                    }

                    replyParent.byId[comment.id] = comment;
                    replyParent.allIds.push(comment.id);
                    replyParent.totalRepliesCount += 1;
                }
            } else {
                if (commentType === "parent") {
                    receiveCommentState.byId[comment.id] = comment;
                } else if (commentType === "reply") {
                    receiveCommentState.byId[comment.parent_id].byId[comment.id] = comment;
                }
            }
                
            return {
                ...state,
                comments: {
                    ...receiveCommentState
                }
            };
        case REMOVE_BUG_COMMENT:
            const deletedCommentState = {
                ...state.comments
            }

            const deletedComment = action.comment;
            const deletedCommentType = action.commentType;

            if (deletedCommentType === "parent") {
                delete deletedCommentState.byId[deletedComment.allDeletedCommentsIds];

                const parentIndex = deletedCommentState.allIds.indexOf(deletedComment.allDeletedCommentsIds);

                if (parentIndex > -1) {
                    deletedCommentState.allIds.splice(parentIndex, 1);
                }

                deletedCommentState.totalComments -= 1;

            } else if (deletedCommentType === "reply") {
                const deleteReplyParent = deletedCommentState.byId[deletedComment.parentId];

                const newIds = [];

                deleteReplyParent.allIds.forEach((id) => {
                    if (deletedComment.allDeletedCommentsIds.includes(id)) {
                        delete deleteReplyParent.byId[id];
                    } else {
                        newIds.push(id);
                    }
                })

                deleteReplyParent.allIds = newIds;
                deleteReplyParent.totalRepliesCount = deletedComment.newCommentsCount;
            }

            return {
                ...state,
                comments: {
                    ...deletedCommentState
                }
            };
        case RECEIVE_EXTRA_BUG_COMMENTS:
            const updateCommentSlice = {
                ...state.comments
            };

            if (action.recalibrate) {
                updateCommentSlice.allIds = action.comments.allIds;

                Object.assign(updateCommentSlice.byId, action.comments.byId);
            } else {
                action.comments.allIds.forEach((id) => {
                    if (!updateCommentSlice.byId[id]) {
                        updateCommentSlice.allIds.push(id);
                    }
                });
            }

            Object.assign(updateCommentSlice.byId, action.comments.byId);

            return {
                ...state,
                comments: {
                    ...updateCommentSlice
                }
            };
        case RECEIVE_EXTRA_NESTED_BUG_COMMENTS:
            const nestedCommentState = {
                ...state.comments
            }

            const nestedComments = action.comments;
            const byIdParent = nestedCommentState.byId[action.parentId];

            if (!byIdParent.hasOwnProperty("byId")) {
                byIdParent.byId = {};
            }

            nestedComments.allIds.forEach(commentId => {
                if (!byIdParent.byId[commentId]) {
                    byIdParent.allIds.push(commentId);
                }
            });

            byIdParent.byId = { ...byIdParent.byId, ...nestedComments.byId };

            if (!action.recalibrate) {
                byIdParent.replyPage += 1;
            }


            return {
                ...state,
                comments: {
                    ...nestedCommentState
                }
            };
        case REMOVE_CURRENT_BUG:
        case REMOVE_BUG:
        case LOGOUT_CURRENT_USER:
            return defaultState;
        default:
            return state;
    }
};

export default CurrentBugReducer;