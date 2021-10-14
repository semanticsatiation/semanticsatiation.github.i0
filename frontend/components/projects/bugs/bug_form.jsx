// first react hook function will start here
import React, { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';

// helpers
import { anyEmptyFields } from "../../../util/helper_functions";

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// components
import SubmitButtonContainer from '../../shared/submit_button_container';
import RadioButtons from "../../shared/radio_buttons";
import ErrorListItem from '../../shared/error_list_item';
import BugWorkersSearch from "./bug_workers_search";
import Bugger from './bugger';

// shared variables
import { allStatuses } from '../../shared/variables';

function BugForm(props) {
    const [state, setState] = useState(props.bugProperties);

    const [allBuggers, setBuggers] = useState(props.buggers);

    const [photoFields, setPhotoFields] = useState({
        photos: props.photos,
        photoPreviews: props.photos.map((photo) => photo.preview)
    });

    const [showBuggerSearchForm, setShowBuggerSearchForm] = useState(false);

    const [stateValues] = useDebounce(state, 650);

    const [photoValues] = useDebounce(photoFields, 300);

    const [buggerValues] = useDebounce(allBuggers, 300);

    const setDeadLine = state.dead_line ? (new Date(state.dead_line).getTime()) : (state.dead_line);

    useEffect(() => {
        if (props.isUpdate) {
            // we need to convert the time to something that 
            // <input type = "datetime-local" />
            // can read but only when we are updating a bug

            // RAILS VERSION:
            // "09-29-2021 03:43 PM"

            // needs to be converted to "datetime-local":
            // "2021-05-28T19:37"
            // so the value can be read properly by <input type = "datetime-local" />

            let tzoffset = (new Date()).getTimezoneOffset() * 60000; 
            let localISOTime = (new Date(new Date(state.dead_line) - tzoffset)).toISOString().slice(0, -1);

            setState({
                ...state,
                dead_line: localISOTime
            });
        }
    }, [])

    useEffect(() => {
        const formData = new FormData();

        addToForm(formData);

        const requestBody = {
            isValidate: true,
            requestOptions: {
                headers: {
                    'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
                },
                body: formData
            },
        }

        if (props.isUpdate) {
            props.updateBug({
                url: `/projects/${props.currentProjectId}/bugs/${props.currentBugId}?validate`,
                ...requestBody
            });
        } else {
            props.createBug({
                url: `/projects/${props.currentProjectId}/bugs?validate`,
                ...requestBody
            });
        }
    }, [stateValues, photoValues, buggerValues]);

    const handleSubmit = (event) => {
        event.preventDefault();

        const formData = new FormData();

        addToForm(formData);

        const requestBody = {
            requestOptions: {
                headers: {
                    'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
                },
                body: formData
            }, 
            setTime: 120000
            // ramp up the abort time to allow for photo submissions
        }

        if (props.isUpdate) {
            props.updateBug({
                url: `/projects/${props.currentProjectId}/bugs/${props.currentBugId}`,
                ...requestBody,
            }).then(
                () => props.closeForm(),
                (errors) => errors
            );
        } else {
            props.createBug({
                url: `/projects/${props.currentProjectId}/bugs`,
                ...requestBody,
            }).then(
                (successfulBug) => props.history.push(`/projects/${props.currentProjectId}/bugs/${successfulBug.id}`),
                (errors) => errors
            );
        }
    }

    const addToForm = (formData) => {
        photoFields.photos.forEach((photo, ind) => {
            if (!photo.id) {
                formData.append(`bug[photos][${ind}]`, photo);
            } else {
                Object.keys(photo).forEach((key) => {
                    formData.append(`bug[photos][${ind}][${key}]`, photo[key]); 
                })
            }
        });

        Object.keys(state).forEach((key) => {
            if (key === "dead_line") {
                formData.append(`bug[${key}]`, setDeadLine);
            } else {
                formData.append(`bug[${key}]`, state[key]);
            }
        });

        if (props.isUpdate) { 
            formData.append(`bug[buggers]`, allBuggers.allIds);
        }
    }

    const handleChange = (event, disabled = false) => {
        if (!disabled) {
            // this is to prevent any mishaps with radio or date
            event.preventDefault();
        }

        const target = event.target;

        setState({ 
            ...state, 
            [target.name]: target.value
        });
    }

    const addWorkerToBug = (worker) => {
        const newBuggers = Object.assign({}, allBuggers);

        newBuggers.byId[worker.id] = worker;
        newBuggers.allIds.push(worker.id);

        setBuggers(newBuggers);
    }

    const removeWorkerFromBug = (buggerId) => {
        const newBuggers = Object.assign({}, allBuggers);

        newBuggers.allIds = newBuggers.allIds.filter((id) => id != buggerId);

        delete newBuggers[buggerId];

        setBuggers(newBuggers);
    }

    const logPhoto = async (event) => {
        const newPhotos = [];
        const newPreviewPhotos = [];
        const files = event.currentTarget.files;

        const readFile = (file, newPhotos, newPreviewPhotos) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();

                reader.onloadend = (e) => {
                    newPhotos.push(file);
                    newPreviewPhotos.push(reader.result);
                    resolve();
                }

                reader.readAsDataURL(file);
            });
        }

        if (files.length > 0) {
            for (const i of Object.keys(files)) {
                const result = await readFile(files[i], newPhotos, newPreviewPhotos);
            }

            return Promise.resolve([newPhotos, newPreviewPhotos]);
        }
        return Promise.reject();
    }

    const removePhoto = (event, index) => {
        event.preventDefault();

        const newPhotos = [...photoFields.photos];
        newPhotos.splice(index, 1);

        const newPhotoPreviews = [...photoFields.photoPreviews];
        newPhotoPreviews.splice(index, 1);

        setPhotoFields({
            photos: newPhotos,
            photoPreviews: newPhotoPreviews
        });
    }
    
    const { 
        title: titleErrors, 
        description: descriptionErrors, priority: priorityErrors, status: statusErrors, 
        severity: severityErrors, expected_result: expectedResultErrors, actual_result: actualResultErrors, 
        environment: environmentErrors, testing_version: testingVersionErrors, dead_line: deadLineErrors, 
        steps: stepErrors, platform: platformErrors, url: urlErrors, 
        components: componentErrors, photos: photoErrors, buggers: buggerErrors
    } = props.errors;


    return (
        <div className="bug-form">
            <form className="foreground-form" onSubmit={handleSubmit}>
                <fieldset disabled={props.isSubmitting}>
                    <button className="exit-icon-button" type="button" onClick={props.closeForm}>
                        <FontAwesomeIcon className="exit-icon" icon="times-circle" />
                    </button>

                    <div>
                        <label htmlFor="title">
                            Title
                            <button type="button">
                                <FontAwesomeIcon className="information-button" icon="question-circle" />
                                <span className="text-hover">
                                    Enter a clear title for the bug, so anyone, regardless of role, can understand it.
                                    <br/>(e.g., “Invoice Will Not Print for User”)
                                </span>
                            </button>

                            <ErrorListItem errors={titleErrors} />
                        </label>

                        <input
                            type="text"
                            name="title"
                            id="title"
                            className={`input-field ${titleErrors ? ("field-error-emphasization") : ("")}`}
                            onChange={handleChange}
                            value={state.title}
                        />
                    </div>

                    <div>
                        <label htmlFor="status">
                            Status
                            <button type="button">
                                <FontAwesomeIcon className="information-button" icon="question-circle" />
                                <span className="text-hover">
                                    What is the current status of the bug?
                                </span>
                            </button>
                            <ErrorListItem errors={statusErrors} />
                        </label>

                        <select className={`input-field ${statusErrors ? ("field-error-emphasization") : ("")}`} name="status" id="status" value={state.status} onChange={handleChange}>{
                            allStatuses.map((status, ind) => (
                                <option value={status} key={ind}>{status}</option>
                            ))
                        }</select>
                    </div>

                    <div>
                        <label htmlFor="description">
                            Description
                            <button type="button">
                                <FontAwesomeIcon className="information-button" icon="question-circle" />
                                <span className="text-hover">
                                    Write a comprehensive description of the bug, so it can easily be understood as to why the software is not working as it should.
                                </span>
                            </button>
                            <ErrorListItem errors={descriptionErrors} />
                        </label>

                        <textarea
                            name="description"
                            id="description"
                            className={`input-field ${descriptionErrors ? ("field-error-emphasization") : ("")}`}
                            onChange={handleChange}
                            value={state.description}
                        ></textarea>
                    </div>

                    <div>
                        <label htmlFor="steps">
                            Steps
                            <button type="button">
                                <FontAwesomeIcon className="information-button" icon="question-circle" />
                                <span className="text-hover">
                                    The steps should include actions that cause the bug. Don’t make generic statements. Be specific in the steps to follow.
                                    <br/>EX:
                                    <br/>1. Go to the login page.
                                    <br/>2. Type nothing in the username field.
                                    <br/>3. Fill in the password field.
                                    <br/>4. Submit.
                                    <br/>5. App crashes.
                                </span>
                            </button>
                            <ErrorListItem errors={stepErrors} />
                        </label>

                        <textarea
                            name="steps"
                            id="steps"
                            className={`input-field ${stepErrors ? ("field-error-emphasization") : ("")}`}
                            onChange={handleChange}
                            value={state.steps}
                        ></textarea>
                    </div>

                    <div>
                        <label htmlFor="expected-result">
                            Expected Result
                            <button type="button">
                                <FontAwesomeIcon className="information-button" icon="question-circle" />
                                <span className="text-hover">
                                    What is the expected result of running the above steps?
                                </span>
                            </button>
                            <ErrorListItem errors={expectedResultErrors} />
                        </label>

                        <input
                            type="text"
                            name="expected_result"
                            id="expected-result"
                            className={`input-field ${expectedResultErrors ? ("field-error-emphasization") : ("")}`}
                            onChange={handleChange}
                            value={state.expected_result}
                        />
                    </div>

                    <div>
                        <label htmlFor="actual-result">
                            Actual Result
                            <button type="button">
                                <FontAwesomeIcon className="information-button" icon="question-circle" />
                                <span className="text-hover">
                                    What is the actual result of running the above steps?
                                </span>
                            </button>
                            <ErrorListItem errors={actualResultErrors} />
                        </label>

                        <input
                            type="text"
                            name="actual_result"
                            id="actual-result"
                            className={`input-field ${actualResultErrors ? ("field-error-emphasization") : ("")}`}
                            onChange={handleChange}
                            value={state.actual_result}
                        />
                    </div>

                    <div>
                        <RadioButtons 
                            handleChange={handleChange} 
                            errors={[priorityErrors, severityErrors]} 
                            getCurrentValue={(name) => state[name]} 
                            radios={
                                {
                                    "priority": {information: "Should this bug be fixed later?  Soon?  Or right away?", options: ["low", "medium", "high"]},
                                    "severity": { information: "How much impact does the bug have on the application?  Is the bug aesthitic?  Does the bug produce incorrect, incomplete, inconsistent results or impairs the application? Or does the bug cause failure of the complete application, subsystem or a program within?", options: ["minor", "major", "critical"]}
                                }
                            } 
                        />
                    </div>

                    <div>
                        <label htmlFor="testing-version">
                            Testing Version
                            <button type="button">
                                <FontAwesomeIcon className="information-button" icon="question-circle" />
                                <span className="text-hover">
                                    What is the application version of the product the bug occured on?
                                    Was the bug located in the application during testing or production?
                                </span>
                            </button>
                            <ErrorListItem errors={testingVersionErrors} />
                        </label>

                        <input
                            type="text"
                            name="testing_version"
                            id="testing-version"
                            className={`input-field ${testingVersionErrors ? ("field-error-emphasization") : ("")}`}
                            onChange={handleChange}
                            value={state.testing_version}
                        />
                    </div>

                    <div>
                        <label htmlFor="platform">
                            Platform
                            <button type="button">
                                <FontAwesomeIcon className="information-button" icon="question-circle" />
                                <span className="text-hover">
                                    What hardware platform was this bug found on?
                                    <br/>PC, MAC, HP, Sun, etc...?
                                    <br/>What version (if applicable)?
                                    <br/>Windows NT, Windows 2000, Windows XP?
                                </span>
                            </button>
                            <ErrorListItem errors={platformErrors} />
                        </label>

                        <input
                            type="text"
                            name="platform"
                            id="platform"
                            className={`input-field ${platformErrors ? ("field-error-emphasization") : ("")}`}
                            onChange={handleChange}
                            value={state.platform}
                        />
                    </div>

                    <div>
                        <label htmlFor="url">
                            URL
                            <button type="button">
                                <FontAwesomeIcon className="information-button" icon="question-circle" />
                                <span className="text-hover">
                                    What URL did the bug occur on?
                                </span>
                            </button>
                            <ErrorListItem errors={urlErrors} />
                        </label>

                        <input
                            type="text"
                            name="url"
                            id="url"
                            className={`input-field ${urlErrors ? ("field-error-emphasization") : ("")}`}
                            onChange={handleChange}
                            value={state.url}
                        />
                    </div>

                    <div>
                        <label htmlFor="environment">
                            Environment
                            <button type="button">
                                <FontAwesomeIcon className="information-button" icon="question-circle" />
                                <span className="text-hover">
                                    What is the environment of the bug?
                                    <br/>Browser name, browser version, etc...
                                </span>
                            </button>
                            <ErrorListItem errors={environmentErrors} />
                        </label>

                        <input
                            type="text"
                            name="environment"
                            id="environment"
                            className={`input-field ${environmentErrors ? ("field-error-emphasization") : ("")}`}
                            onChange={handleChange}
                            value={state.environment}
                        />
                    </div>

                    <div>
                        <label htmlFor="components">
                            Component
                            <button type="button">
                                <FontAwesomeIcon className="information-button" icon="question-circle" />
                                <span className="text-hover">
                                    What part of the website did the bug occur on?
                                    <br/>Homepage, login page, profile page?
                                </span>
                            </button>
                            <ErrorListItem errors={componentErrors} />
                        </label>

                        <input
                            type="text"
                            name="components"
                            id="components"
                            className={`input-field ${componentErrors ? ("field-error-emphasization") : ("")}`}
                            onChange={handleChange}
                            value={state.components}
                        />
                    </div>

                    <div>
                        <label htmlFor="dead-line">
                            Dead line
                            <button type="button">
                                <FontAwesomeIcon className="information-button" icon="question-circle" />
                                <span className="text-hover">
                                    When is this bug expected to be fixed?
                                </span>
                            </button>
                            <ErrorListItem errors={deadLineErrors} />
                        </label>

                        <input
                            type="datetime-local"
                            name="dead_line"
                            id="dead-line"
                            className={`input-field ${deadLineErrors ? ("field-error-emphasization") : ("")}`}
                            onChange={handleChange}
                            value={state.dead_line}
                        />
                    </div>
                    
                    <div>{
                        props.isUpdate ? (
                            <>
                                <label htmlFor="buggers">
                                    Add bugger

                                    <button type="button">
                                        <FontAwesomeIcon className="information-button" icon="question-circle" />
                                        <span className="text-hover">
                                            Who will take on this bug?
                                        </span>
                                    </button>
                                    <ErrorListItem errors={buggerErrors} />
                                </label>

                                <div className="buggers-container">
                                    <ul className={`buggers-list input-field ${buggerErrors ? ("field-error-emphasization") : ("")}`}>
                                        {
                                            showBuggerSearchForm ? (
                                                <BugWorkersSearch
                                                    addable={true}
                                                    buggerAllIds={allBuggers.allIds}
                                                    projectId={props.currentProjectId}
                                                    currentBugId={props.currentBugId}
                                                    addWorkerToBug={(user) => addWorkerToBug(user)}
                                                    setShowBuggerSearchForm={setShowBuggerSearchForm}
                                                />
                                            ) : (null)
                                        }
                                        <li className="buggers-list-item" onClick={e => setShowBuggerSearchForm(!showBuggerSearchForm)}>
                                            <button type="button">
                                                <FontAwesomeIcon className="add-bugger-icon" icon="plus-circle" />
                                            </button>
                                        </li>
                                        {
                                            allBuggers.allIds.map((buggerId) => {
                                                const bugger = allBuggers.byId[buggerId];

                                                return (
                                                    <li className="buggers-list-item" onClick={e => removeWorkerFromBug(buggerId)} title={bugger.username} key={buggerId}>
                                                        <button className="exit-icon-button" type="button">
                                                            <FontAwesomeIcon className="exit-icon" icon="times-circle" />
                                                        </button>
                                                        <Bugger bugContributer={bugger}/>
                                                    </li>
                                                )
                                            })
                                        }
                                    </ul>
                                </div>
                            </>
                        ) : (null)
                    }</div>

                    <div>
                        <label htmlFor="photos">
                            Photo attachments
                            <button type="button">
                                <FontAwesomeIcon className="information-button" icon="question-circle" />
                                <span className="text-hover">
                                    Screenshots are encouraged!
                                </span>
                            </button>
                            <ErrorListItem errors={photoErrors} />
                        </label>

                        {
                            photoFields.photoPreviews.length > 0 ? (
                                <div className="bug-photos-container">{
                                    photoFields.photoPreviews.map((photoPreview, ind) => (
                                        <button className="bug-photo-button" onClick={(e) => removePhoto(e, ind)} key={ind}>
                                            <img className="bug-photo" srcSet={photoPreview} />
                                            <FontAwesomeIcon className="exit-icon" icon="times-circle" />
                                        </button>
                                    ))
                                }</div>
                            ) : (
                                null
                            )
                        }

                        <input className={`${photoErrors ? ("field-error-emphasization") : ("")}`} type="file" name="photos" id="photos" multiple onChange={e => logPhoto(e).then(
                            (results) => setPhotoFields({
                                photos: [...photoFields.photos, ...results[0]],
                                photoPreviews: [...photoFields.photoPreviews, ...results[1]]
                            }),
                            (errors) => errors
                        )} />
                    </div>

                    <div>
                        <SubmitButtonContainer
                            submitValue={`${props.isUpdate ? ("Update") : ("Submit")} Bug`}
                            anyEmptyFields={anyEmptyFields(...Object.values(state))}
                        />
                    </div>
                </fieldset>
            </form>
        </div>
    )
}

export default BugForm;