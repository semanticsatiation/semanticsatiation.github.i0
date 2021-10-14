import React, { useState } from "react";

// Components
import PhotoFormContainer from "./photo_form_container";
import FormSectionsContainer from "./form_sections_container";
import UserProfileField from "./user_profile_field";
import DeleteForm from "../shared/delete_form";
import PFPIcon from '../../../src/default-profile-picture.png'

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function UserProfile(props) {
    const [toggleSpecificForm, setToggleSpecificForm] = useState("");

    const { username, photoURL, biography, id } = props.currentUser;

    const similarFields = [
        ["Username", username],
        ["Biography", biography || "..."],
        ["Password", "* * * * * * *"]
    ].map((field, ind) => (
        <UserProfileField fieldName={field[0]} fieldValue={field[1]} toggleForm={setToggleSpecificForm} key={ind} />
    ));

    const renderForm = () => {
        if (toggleSpecificForm === "photo") {
            return <PhotoFormContainer currentUser={props.currentUser} toggleForm={setToggleSpecificForm} isSubmitting={props.isSubmitting} />
        } else if (toggleSpecificForm === "delete") {
            // return <DeleteForm
            //     deleteAction={() => props.deleteUser({ url: `/users/${id}` })}
            //     newPath="/login"
            //     closeForm={() => setToggleSpecificForm("")}
            //     confirmationText="Confirm Deletion"
            // />
            null
        } else if (toggleSpecificForm != "") {
            return <FormSectionsContainer 
                objectName={toggleSpecificForm} 
                objectValue={toggleSpecificForm === "password" ? ("") : (eval(toggleSpecificForm))} 
                currentUserId={id} 
                toggleForm={setToggleSpecificForm}
                isSubmitting={props.isSubmitting}
            />
        } else {
            return null
        }
    }

    return (
        <div className="user-info-container">
            <ul className="user-info-list">
                <li className="edit-photo-link" onClick={e => setToggleSpecificForm("photo")}>
                    <button>
                        <div className="user-avatar-large-container">
                            <img srcSet={photoURL === "https://bug-off-dev.s3.us-east-2.amazonaws.com/default-profile-picture.png" ? (PFPIcon) : (photoURL)} />
                        </div>
                        <div className="edit-avatar">
                            <FontAwesomeIcon icon="camera-retro" />
                        </div>
                    </button>
                </li>
                {similarFields}
                {/* 
                    SERIOUS
                    ON USER DELETION, MAKE SURE WE PASS ALL BUGS TO THE OWNER OF THE PROJECT
                    IF THE PROJECT OWNER IS THE USER BEING DELETED, DELETE AS USUAL
                 */}
                {/* <li className="delete-button">
                    <button type="button" onClick={e => setToggleSpecificForm("delete")}>
                        Delete Account
                    </button>
                </li> */}
            </ul>

            {renderForm()}
        </div>
    )

}

export default UserProfile;