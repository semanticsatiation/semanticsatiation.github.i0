import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { useDebounce } from 'use-debounce';

// helpers
import { anyEmptyFields } from "../../util/helper_functions";

// components
import ErrorListItem from "../shared/error_list_item";
import SubmitButtonContainer from "../shared/submit_button_container";
import HiddenPasswordInput from "./hidden_password_input";


function SessionForm(props) {
    const [state, setState] = useState({
        username: "",
        password: "",
    })

    const isSignUp = props.type === "Sign Up";

    const [value] = useDebounce(state, 650);

    useEffect(() => {
        if (isSignUp) {
            props.submit({
                body: {user: state},
                url: "/users?validate",
                isValidate: true
            });
        }
    }, [value])

    const submitForm = (event, guest) => {
        event.preventDefault();

        if (!props.isSubmitting) {
            props.submit({
                body: { [isSignUp ? ("user") : ("session")]: { ...state, guest: guest } },
                url: isSignUp ? ("/users") : ("/session")
            });
        }
    }

    const logChange = (event) => {
        event.preventDefault();

        const target = event.target;

        setState({
            ...state,
            [target.name]: target.value
        });
    }


    let sessionLink;
    let title = isSignUp ? ("Welcome To BugOff") : ("Welcome Back");

    let registrationProps = isSignUp ? (["/login", "Already have an account?"]) : (["/signup", "Need an account?"]);
    sessionLink = <Link className="text-link" to={registrationProps[0]}>{registrationProps[1]}</Link>;

    return(
        <div className="form-container">
            <img className="large-app-logo" src={"https://bug-off-public.s3.us-east-2.amazonaws.com/bug_off_logo.svg"} alt="BugOff Logo" />
            <form className="signup-login-form" onSubmit={submitForm}>
                <ErrorListItem errors={props.errors.session_form} />
                <fieldset>
                    <h1 className="form-title">{title}</h1>
                    <label htmlFor="username">
                        Username (case insensitive)
                        <ErrorListItem errors={props.errors.username} />
                    </label>
                    <input
                        className={`input-field ${props.errors.username ? ("field-error-emphasization") : ("")}`}
                        type="text"
                        name="username"
                        id="username"
                        onChange={logChange}
                        value={state.username}
                        placeholder="Username"
                    />
                    
                    <HiddenPasswordInput
                        logChange={logChange}
                        passwordOptions={{ passwordFieldId: "password", label: "Password" }}
                        errors={props.errors.password}
                    />

                    {/* disable this until all fields are valid! */}
                    {
                        props.type == "Log In" ? (
                            <div className="login-div">
                                <div onClick={e => submitForm(e, false)}>
                                    <SubmitButtonContainer submitValue={props.type} exposeSubmit={!isSignUp} anyEmptyFields={anyEmptyFields(state.username, state.password)} />
                                </div>
                                <div onClick={e => submitForm(e, true)}>
                                    <SubmitButtonContainer submitValue={"Guest"} exposeSubmit={!isSignUp} anyEmptyFields={anyEmptyFields(state.username, state.password)} />
                                </div>
                            </div>
                        ) : (<SubmitButtonContainer submitValue={props.type} exposeSubmit={!isSignUp} anyEmptyFields={anyEmptyFields(state.username, state.password)} />)
                    }
                </fieldset>
            </form>
            {sessionLink}
        </div>
    )
}

export default SessionForm;