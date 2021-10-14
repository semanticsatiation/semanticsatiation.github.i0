import React, { useEffect, useState } from "react";
import { withRouter } from "react-router-dom";
import { useDebounce } from 'use-debounce';

// helpers
import { anyEmptyFields } from "../../util/helper_functions";

// components
import ErrorListItem from "../shared/error_list_item";
import SubmitButtonContainer from "../shared/submit_button_container";
import { CONTRIBUTED_PROJECTS } from "../shared/variables";

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function ProjectForm(props) {
    const [state, setState] = useState({
        name: props.project.name,
        description: props.project.description,
        // can't have the current organization id be an organization that doesn't promote the 
        // creation of new projects so we can avoid this by just defaulting to the first valid organization
    })

    const [organizationId, setOrganizationId] = useState(props.currentOrganization.name === CONTRIBUTED_PROJECTS ? (props.organizations[0].id) : (props.currentOrganization.id));

    const [value] = useDebounce(state, 650);

    useEffect(() => {
        if (!props.isReadForm) {
            const formOpt = {
                body: { project: Object.assign({}, { name: state.name.trim(), description: state.description.trim() }) },
                isValidate: true,
            }

            if (props.isUpdateForm) {
                props.updateProject({
                    ...formOpt,
                    url: `/organizations/${organizationId}/projects/${props.match.params.projectId}?validate`
                });
            } else {
                props.createProject({
                    ...formOpt,
                    url: `/organizations/${organizationId}/projects?validate`
                });
            }
        }
    }, [value, organizationId])


    const logChange = (event) => {
        event.preventDefault();

        const target = event.target;

        setState({
            ...state,
            [target.name]: target.value
        });
    }

    const submitForm = (event) => {
        event.preventDefault();

        const url = `/organizations/${organizationId}/projects`;

        const data = { project: Object.assign({}, { name: state.name.trim(), description: state.description.trim() }) };

        if (props.isUpdateForm) {
            props.updateProject({
                body: data,
                url: url + `/${props.match.params.projectId}`
            }).then(
                () => props.extraProjectsFetch(),
                (errors) => errors
            );
        } else {
            // if we are creating a project for the current organization, head straight to the project
            // otherwise, have the currentOrganizationId be changed by the createProject async action
            // and then head to the homepage to fetch all the projects for the new organization 
            // and finally head to the new project that was just created for the said organization
            if (organizationId === props.currentOrganization.id) {
                props.createProject({
                    body: data,
                    url: url
                }, true).then(
                    (newProject) => {
                        // close the form first THEN do what needs to be done
                        // if i push the history and then close the form, i am closing something that has already unmounted!
                        // thus giving me the following error:
                        // Warning: Can't perform a React state update on an unmounted component.
                        props.closeProjectForm();
                        props.history.push(`/projects/${newProject.id}/activity`);
                    },
                    (errors) => errors
                );
            } else {
                props.createProject({
                    body: data,
                    url: url
                }).then(
                    (newProject) => {
                        props.closeProjectForm();
                        props.changeCurrentOrganization(parseInt(organizationId));

                        const routerState = {
                            pathname: "/projects",
                            projectFetch: () => {
                                props.history.push({
                                    pathname: `/projects/${newProject.id}/activity`,
                                });
                            },
                        };

                        props.history.replace(routerState);
                    },
                    (errors) => errors
                );
            }
        }
    }

    const { type, isUpdateForm, isReadForm, closeProjectForm, errors, isSubmitting, isBoxxed } = props;

    let content = (
        <form className="foreground-form" onSubmit={submitForm}>
            <fieldset disabled={isReadForm || isSubmitting}>
                {
                    isUpdateForm || isReadForm ? (
                        <h1>Project Settings</h1>
                    ) : (
                        <button className="exit-icon-button" type="button" onClick={closeProjectForm}>
                            <FontAwesomeIcon className="exit-icon" icon="times-circle" />
                        </button>
                    )
                }

                <label htmlFor="name">
                    Name
                    <ErrorListItem errors={errors.name} />
                </label>
                <input
                    type="text"
                    name="name"
                    id="name"
                    className={`input-field ${errors.name ? ("field-error-emphasization") : ("")}`}
                    onChange={logChange}
                    value={state.name}
                    autoFocus={!isReadForm}
                />

                <label htmlFor="description">
                    Description
                    <ErrorListItem errors={errors.description} />
                </label>
                <input
                    type="text"
                    name="description"
                    id="description"
                    className={`input-field ${errors.description ? ("field-error-emphasization") : ("")}`}
                    onChange={logChange}
                    value={state.description}
                />

                {
                    isUpdateForm || isReadForm ? (null) : (
                        <>
                            <label htmlFor="organization">
                                Organization
                                <ErrorListItem errors={errors.organization} />
                            </label>
                            <select 
                                name="organization_id" 
                                id="organization" 
                                className={`input-field ${errors.organization ? ("field-error-emphasization") : ("")}`}
                                value={organizationId} 
                                onChange={(e) => setOrganizationId(e.target.value)}>{
                                props.organizations.map(org =>
                                    <option value={org.id} key={org.id}>{org.name}</option>
                                )
                            }</select>
                        </>
                    )
                }

                {
                    !isReadForm ? (
                        <SubmitButtonContainer submitValue={type === "update" ? ("Update Project") : ("Create Project")} anyEmptyFields={anyEmptyFields(state.name, state.description)} />
                    ) : (null)
                }
            </fieldset>
        </form>
    );

    if (isBoxxed) {
        content = <div className="close-form">{content}</div>
    }

    return (
        content
    )
}

export default withRouter(ProjectForm);