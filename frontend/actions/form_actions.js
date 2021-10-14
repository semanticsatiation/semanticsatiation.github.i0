export const RECEIVE_FORM_ERRORS = "RECEIVE_FORM_ERRORS";
export const CLEAR_FORM_ERRORS = "CLEAR_FORM_ERRORS";

export const receiveFormErrors = (formErrors) => ({
    type: RECEIVE_FORM_ERRORS,
    formErrors: formErrors
});

export const clearFormErrors = () => ({
    type: CLEAR_FORM_ERRORS
});