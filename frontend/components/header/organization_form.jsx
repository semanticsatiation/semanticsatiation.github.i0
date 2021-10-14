// first react hook function will start here
import React, { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';

// helpers
import { anyEmptyFields } from "../../util/helper_functions";

// components
import ErrorListItem from "../shared/error_list_item";
import SubmitButtonContainer from "../shared/submit_button_container";
import DeleteForm from "../shared/delete_form";

// shared variables
import { CONTRIBUTED_PROJECTS, PERSONAL_PROJECTS } from '../shared/variables';

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// RULES FOR HOOKS
// Don’t call Hooks inside loops, conditions, or nested functions.
// Instead, always use Hooks at the top level of your React function.


const immutableOrganizations = [PERSONAL_PROJECTS, CONTRIBUTED_PROJECTS];

function OrganizationForm(props) {
    const isImmutable = props.isUpdate ? (immutableOrganizations.includes(props.name)) : (false);


    // the following is equal to 
    // this.state = ({
    //     name: ""
    // })
    // setName is equal to this.setState({name: newName})
    // notice how we don't have to use objects anymore for the state
    const [name, setName] = useState(props.name);
    // we can refer to name with just name unlike before where we had
    // to do this.state.name

    const [isFormExposed, setIsFormExposed] = useState(false);

    // this will trigger 650 milliseconds after the user stop typing 
    const [value] = useDebounce(name, 650);
    // hooks are different meaning we need to use debounce instead of timeout

    // we can have multiple useEffect functions each one will be 
    // executed in the order they are created meaning top to bottom


    // If you want to run an effect and clean it up only once (on mount and unmount), 
    // you can pass an empty array ([]) as a second argument. This tells React that your 
    // effect doesn’t depend on any values from props or state, so it never needs to re-run. 
    // This isn’t handled as a special case — it follows directly from how the dependencies array always works.

    // useEffect can be equal to componentWillMount/componentDidUpdate/componentWillUnmount
    // make this effect execute only on mount by passing an empty array as the second argument
    // // useEffect(() => {
        // to clean up our component, we need to return a function
        // this function will run every time this component re-renders
        // obviously there are times where we want to avoid this
        // this is similar to componentWillUnmount
    // //    return function cleanUpForm() {
    // //    };
    // // }, []);


    // what if we want to run an effect only if something happens
    // all we need to do is pass a second argument to useEffect like so
    useEffect(() => {
        if (!isImmutable) {
            const body = { organization: { name: name.trim() } };

            if (props.isUpdate) {
                props.updateOrganization({
                    body: body,
                    isValidate: true,
                    url: `/organizations/${props.currentOrganization.id}?validate`
                });
            } else {
                props.createOrganization({
                    body: body,
                    isValidate: true,
                    url: "/organizations?validate"
                });
            }
        }
    }, [value]);
    // this is saying to execute this effect only when the variable value changes
    // this is also for effects that have a cleanup phase!

    const submitForm = (event) => {
        // UGH, i forgot to prevent the default behaviour of submit and i was 
        // wondering why my app kept refreshing after i would submit this form!!!!!!
        event.preventDefault();

        const submitOptions = props.isUpdate ? (
            [props.updateOrganization, `/organizations/${props.currentOrganization.id}`, () => null]
        ): (
            [props.createOrganization, "/organizations", props.closeOrganizationForm]
        );
        
        submitOptions[0]({
            body: { organization: { name: name.trim() } },
            url: submitOptions[1]
        }).then(
            () => submitOptions[2](),
            (errors) => errors
        );
    }

    return (
        <div className={`${props.isUpdate ? ("open-form") : ("close-form")}`}>
            <form className="foreground-form" onSubmit={submitForm}>
                <fieldset disabled={props.isSubmitting || !props.isOwner || isImmutable}>
                    {
                        props.isUpdate ? (
                            null
                        ) : (
                            <button className="exit-icon-button" type = "button" onClick = {props.closeOrganizationForm}>
                                <FontAwesomeIcon className="exit-icon" icon="times-circle" />
                            </button>
                        )
                    }

                    <label htmlFor="name">
                        Name
                        <ErrorListItem errors={props.errors.name} />
                    </label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        className={`input-field ${props.errors.name ? ("field-error-emphasization") : ("")}`}
                        onChange={e => setName(e.target.value)}
                        value={name}
                        autoFocus
                    />

                    {
                        !isImmutable ? (
                            <SubmitButtonContainer submitValue={`${props.type} Organization`} anyEmptyFields={anyEmptyFields(name)} />
                        ) : (null)
                    }
                </fieldset>
            </form>

            {
                props.isOwner && props.isUpdate && !isImmutable ? (
                    <button className="delete-button" onClick={(e) => setIsFormExposed(true)}>Delete Organization</button>
                ) : (null)
            }

            {
                isFormExposed ? (
                    <DeleteForm 
                        deleteAction={() => props.deleteOrganization({url: `/organizations/${props.currentOrganization.id}`})} 
                        newPath="/projects" 
                        closeForm={() => setIsFormExposed(false)} 
                        confirmationText="Confirm Organization Deletion"
                    />
                ) : (null)
            }
        </div>
    );
}
export default OrganizationForm;