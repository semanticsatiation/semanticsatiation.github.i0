import React from "react";

// components 
import ErrorListItem from "../shared/error_list_item";

// wonder if this can be turned into a functional component???
function BiographyField({biography, logChange, errors}) {
    return (
        <>
            <label htmlFor="biography">
                Biography
                <ErrorListItem errors={errors} />
            </label>
            <textarea
                className={`input-field ${errors ? ("field-error-emphasization") : ("")}`}
                name="biography"
                id="biography"
                onChange={logChange}
                value={biography}
                placeholder="Tell us more about you!"
                autoFocus
            ></textarea>
            <div className="word-counter">{biography.length} chars (max is 150)</div>
        </>
    )
}

export default BiographyField;