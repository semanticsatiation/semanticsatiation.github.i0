import React, { useEffect, useState } from "react";
import { useDebounce } from 'use-debounce';

// helpers
import { anyEmptyFields } from "../../util/helper_functions";

//components
import BiographyField from "./biography_field";
import UsernameField from "./username_field";
import PasswordField from "./password_field";
import SubmitButtonContainer from "../shared/submit_button_container";

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';



function FormSections({ objectName, objectValue, submit, errors, toggleForm, currentUserId, isSubmitting }) {
    const [formFields, setFormFields] = useState(objectName === "password" ? (
            {
                old_password: "",
                password: "",
                password_confirmation: ""
            }
        ) : (
            {
                [objectName]: objectValue
            }
        ) 
    )

    const [value] = useDebounce(formFields, 650);

    useEffect(() => {
        submit({
            url: `/users/${currentUserId}?validate`,
            body: { user: { ...Object.assign({}, formFields) } },
            isValidate: true
        });
    }, [value])

    const logChange = (event) => {
        setFormFields({
            ...formFields,
            [event.target.name]: event.target.value
        });
    }

    const handleSubmit = (event) => {
        event.preventDefault();

        submit({
            url: `/users/${currentUserId}`,
            body: { user: { ...Object.assign({}, formFields) } },
        }).then(
            () => toggleForm(""),
            (errors) => errors
        );
    }

    const renderForm = () => {
        if (objectName === "password") {
            return <PasswordField logChange={logChange} errors={errors} />;
        } else if (objectName === "biography") {
            return <BiographyField biography={formFields[objectName]} errors={errors.biography} chars={formFields[objectName].length} logChange={logChange} />;
        } else {
            return <UsernameField username={formFields[objectName]} errors={errors.username} logChange={logChange} />;
        }
    }

    return (
        <div className="close-form">
            <form className="foreground-form" onSubmit={handleSubmit}>
                <fieldset disabled={isSubmitting}>
                    <button className="exit-icon-button" type="button" onClick={e => toggleForm("")}>
                        <FontAwesomeIcon className="exit-icon" icon="times-circle" />
                    </button>
                    {renderForm()}
                    {/* 
                        the biography line is for when a user submits nothing or when a user passes too many characters into the form; 
                        these are things we have to take into account when disabling the submit button 
                    */}
                    <SubmitButtonContainer 
                        submitValue="Update" 
                        exposeSubmit={formFields.hasOwnProperty('biography') && formFields.biography.length <= 150} 
                        anyEmptyFields={anyEmptyFields(...Object.values(formFields)) || (formFields.hasOwnProperty('biography') && formFields.biography.length > 150)} 
                    />
                </fieldset>
            </form>
        </div>
    )
}



export default FormSections;