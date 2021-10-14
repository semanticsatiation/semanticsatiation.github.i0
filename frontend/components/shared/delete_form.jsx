import React, { useState } from "react";
import { withRouter } from "react-router-dom";

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// components
import SubmitButtonContainer from "./submit_button_container";

function DeleteForm(props) {
    const [confirmation, setConfirmation] = useState("");

    const submitValue = props.submitValue === undefined ? ("delete") : (props.submitValue);

    const confirmDeletion = (event) => {
        event.preventDefault();

        props.deleteAction().finally(
            () => props.history.push(props.newPath)
        );
        // always head to the newPath whether a dleetion failed or not to be safe
    }

    return (
        <div className="close-form">
            <form className="foreground-form" onSubmit={confirmDeletion}>
                <fieldset>
                    {/* By default a button submits the form (has type set to submit). Setting type="button" signifies that it has no default behavior. */}
                    <button className="exit-icon-button" type="button" onClick={props.closeForm}>
                        <FontAwesomeIcon className="exit-icon" icon="times-circle" />
                    </button>

                    <label htmlFor="delete">{props.confirmationText}</label>
                    <input
                        className="input-field"
                        type="text"
                        name="delete"
                        id="delete"
                        value={confirmation}
                        onChange={e => setConfirmation(e.target.value)}
                        placeholder={`type '${submitValue}' here`}
                        autoFocus
                    />

                    <SubmitButtonContainer submitValue={submitValue} anyEmptyFields={submitValue != confirmation.toLowerCase()} />
                </fieldset>
            </form>
        </div>
    )
}

export default withRouter(DeleteForm);