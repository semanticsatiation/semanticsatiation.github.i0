import React from "react";

// components
import HiddenPasswordInput from "./hidden_password_input";

function PasswordField({logChange, errors}) {
    return (
        [
            { passwordFieldId: "old-password", passwordFieldName: "old_password", label: "Old Password" },
            { passwordFieldId: "password", label: "New Password" },
            { passwordFieldId: "password-confirmation", passwordFieldName: "password_confirmation", label: "New Password Confirmation", placeHolder: "Confirm New Password" }
        ].map((options, ind) => (
            <HiddenPasswordInput
                logChange={logChange}
                passwordOptions={options}
                key={ind}
                errors={errors[options.passwordFieldName || options.passwordFieldId]}
            />
        ))
    )
}

export default PasswordField;