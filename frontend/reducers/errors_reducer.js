const { combineReducers } = require("redux");
import formErrorsReducer from "./form_errors_reducer";


const errorsReducer = combineReducers({
    formErrors: formErrorsReducer,
    
})

export default errorsReducer;