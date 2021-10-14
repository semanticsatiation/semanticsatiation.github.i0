import React from "react";

function UserProfileField({fieldName, fieldValue, toggleForm}) {
    const lowercaseField = fieldName.toLowerCase();

    return (
        <li className="user-profile-item">
            <div>
                <h1>{fieldName}</h1>
                <button type="button" onClick={e => toggleForm(lowercaseField)}>edit</button>
            </div>
            <p className={lowercaseField}>
                {fieldValue}
            </p>
        </li>
    )
}

export default UserProfileField;