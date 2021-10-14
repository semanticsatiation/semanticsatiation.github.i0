import React, {useState} from "react";
import PFPIcon from '../../../src/default-profile-picture.png';

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect } from "react";


//components
import SubmitButtonContainer from "../shared/submit_button_container";
import ErrorListItem from "../shared/error_list_item";

function PhotoForm(props) {
    const [photoFields, setPhotoFields] = useState({
        currentPhoto: props.currentUser.photoURL === "https://bug-off-dev.s3.us-east-2.amazonaws.com/default-profile-picture.png" ? (PFPIcon) : (props.currentUser.photoURL),
        photo: undefined,
        photoPreview: undefined,
    });

    useEffect(() => {
        const formData = new FormData();

        formData.append("user[photo]", photoFields.photo);

        props.submitPhotos({
            url: `/users/${props.currentUser.id}?validate`,
            isValidate: true,
            requestOptions: {
                headers: {
                    'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
                },
                body: formData
            }
        });
    }, [photoFields.photo])

    const handleSubmit = (event) => {
        event.preventDefault();

        const formData = new FormData();

        formData.append("user[photo]", photoFields.photo);

        // i am also puttng the user id here in the formData so Rack::Attack can have 
        // an id to attach a presence to, in order to track
        // how many requests have been made from a specific user
        // for some reason I can't just do params[:id] in rack_attack.rb
        // because it doesn't see anything outside of the model it's targeting, idk why
        // for example, when updating a user, the id is always outside params[:user] and
        // at the top level of params but rack_attack.rb will only focus on params[:user]
        // formData.append("user[id]", props.currentUser.id);
        // UPDATE: Staying away from Rack::Attack for now until i figure out how to implement it correctly

        props.submitPhotos({
            url: `/users/${props.currentUser.id}`,
            requestOptions: {
                headers: {
                    'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
                },
                body: formData
            },
            setTime: 120000
        }).then(
            () => props.toggleForm(""),
            (errors) => errors 
        );
    }

    const logPhoto = (event) => {
        const file = event.currentTarget.files[0];
        const fileReader = new FileReader();

        fileReader.onloadend = () => (
            setPhotoFields({
                ...photoFields,
                photo: file,
                photoPreview: fileReader.result,
            })
        )

        if (file) {
            fileReader.readAsDataURL(file);
        }
        // we are using fileReader to create a preview of the image for the 
        // user to see before they upload it to AWS S3
    }

    return (
        // each user info item will have an edit button so people can update single options at a time
        <div className="close-form">
            <form className="foreground-form" onSubmit={handleSubmit}>
                <fieldset disabled={props.isSubmitting}>
                    <label htmlFor="photo">
                        Profile Picture
                        <ErrorListItem errors={props.errors.photo} />
                    </label>

                    <button className="exit-icon-button" type="button" onClick={e => props.toggleForm("")}>
                        <FontAwesomeIcon className="exit-icon" icon="times-circle" />
                    </button>

                    <div className="user-avatar-x-large-container">
                        <img srcSet={photoFields.photoPreview || photoFields.currentPhoto} />
                        <div className="edit-avatar">
                            PREVIEW
                        </div>
                    </div>

                    <input className={`${props.errors.photo ? ("field-error-emphasization") : ("")}`} type="file" onChange={logPhoto} />

                    <SubmitButtonContainer
                        submitValue="Update"
                        anyEmptyFields={photoFields.photo === undefined}
                    />
                </fieldset>
            </form>
        </div>
    )
}

export default PhotoForm;