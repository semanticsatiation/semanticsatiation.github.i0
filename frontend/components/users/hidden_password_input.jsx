import React from "react";
import { useState } from "react";
import { withRouter } from 'react-router-dom';

// icons: could probably find a better way to import this
// icons 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// components
import ErrorListItem from "../shared/error_list_item";

function HiddenPasswordInput(props) {
    const [state, setState] = useState({
        [props.passwordOptions.passwordFieldName || props.passwordOptions.passwordFieldId]: "",
        hiddenPassword: true,
    });

    const { passwordFieldId, passwordFieldName, label, placeHolder } = props.passwordOptions;

    const logChange = (event) => {
        event.preventDefault();

        const target = event.target;

        setState({
            ...state,
            [target.name]: target.value,
        })

        props.logChange(event);
    }

    return (
        <div className="password-field-container">
            <label htmlFor={
                passwordFieldName}>{label}
                <ErrorListItem errors={props.errors} />
            </label>

            <div>
                <input
                    className={`input-field password ${props.errors ? ("field-error-emphasization") : ("")}`}
                    type={state.hiddenPassword === true ? ("password") : ("text")}
                    id={passwordFieldId}
                    name={passwordFieldName || passwordFieldId}
                    onChange={logChange}
                    value={state[passwordFieldName || passwordFieldId]}
                    placeholder={placeHolder || label}
                />
                {/*    
                    FOR HTML ONLY: 
                    !state.hiddenPassword === true ? (passwordField.type = "password") : (passwordField.type = "text");

                    do i need to change the type back to "password" when submitting the form?

                    UPDATE:
                    no because this isn't HTML where the form itself is being sent to the back server
                    instead we are just sending the state which always has the uncensored password 
                    and it is always filtered when sent to the backend with Fetch

                    REMEMBER: ALWAYS CHANGE IT BACK WHEN USING HTML ONLY
                */}
                <button type="button">
                    <FontAwesomeIcon
                        className="password-visibility-icon"
                        icon={state.hiddenPassword === true ? ("eye-slash") : ("eye")}
                        onClick={e => setState({ ...state, hiddenPassword: !state.hiddenPassword })}
                    />
                </button>
            </div>
        </div>
    )
}

export default withRouter(HiddenPasswordInput);