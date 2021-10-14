import React from "react";

const ErrorListItem = ({errors}) => {
    if (!errors) {
        return (
            null
        )
    }

    return (
        <span className="error-list-item">{errors[0]}</span>
    )
}

export default ErrorListItem;