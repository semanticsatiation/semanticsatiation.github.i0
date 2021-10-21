import React from "react";

// components
import ErrorListItem from "../shared/error_list_item";

// wonder if this can be turned into a functional component???
function UsernameField({username, logChange, errors}) {
    return (
        <>
            <label htmlFor="username">
                Username (case insensitive)
                <ErrorListItem errors={errors} />
            </label>
            <input
                className={`input-field ${errors ? ("field-error-emphasization") : ("")}`}
                type="text"
                name="username"
                id="username"
                onChange={logChange}
                value={username}
                placeholder="Who are you?"
                autoFocus
            />
        </>
    )
}

export default UsernameField;