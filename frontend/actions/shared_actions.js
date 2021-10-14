import * as SharedUtil from "../util/shared_util";

export const START_SUBMISSION = "START_SUBMISSION";
export const END_SUBMISSION = "END_SUBMISSION";

export const CREATE_OBJECT = "CREATE_OBJECT";
export const UPDATE_OBJECT = "UPDATE_OBJECT";
export const DELETE_OBJECT = "DELETE_OBJECT";
export const RECEIVE_SORT_BY = "RECEIVE_SORT_BY";

export const startSubmitting = () => ({
    type: START_SUBMISSION
});

export const endSubmitting = () => ({
    type: END_SUBMISSION
});

export const receiveSortBy = (sortBy) => ({
    type: RECEIVE_SORT_BY,
    sortBy: sortBy,
});


// async actions
export const sharedActions = (action, formOpt, dispatch, dispatchSuccessfulActions, dispatchFailedActions) => {
    let apiRequest;

    switch (action) {
        case CREATE_OBJECT:
            apiRequest = () => SharedUtil.createObject(formOpt);
            break;
        case UPDATE_OBJECT:
            apiRequest = () => SharedUtil.updateObject(formOpt);
            break;
        case DELETE_OBJECT:
            apiRequest = () => SharedUtil.deleteObject(formOpt);
            break;
    };
    
    if (!formOpt.isValidate) {
        dispatch(startSubmitting());
    }

    return apiRequest().then(
        (successfulResponse) => dispatchSuccessfulActions(successfulResponse),
        (failedResponse) => dispatchFailedActions(failedResponse)
    ).finally(
        () => {
            if (!formOpt.isValidate) {
                dispatch(endSubmitting());
            }
        }
    )
};