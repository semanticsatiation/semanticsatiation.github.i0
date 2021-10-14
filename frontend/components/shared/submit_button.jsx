import React, { useEffect } from "react";
import { endLastFetchRequest } from "../../util/shared_util";

// components
import Loading from "./loading";

function SubmitButton({ inProgress, submitValue = "submit", disableSubmit, clearFormErrors }) {
    useEffect(() => {
        return () => {
            // the following can be removed from other form Components
            endLastFetchRequest();
            clearFormErrors();
        };
    }, []);

    return (
        // disable submit on mount but how???
        inProgress ? (
            <div className="form-submit-button submit-error-emphasization">
                <Loading size="small-spinner" />
            </div>
        ) : (
            <input type="submit" value={submitValue} className={`form-submit-button ${disableSubmit ? ("submit-error-emphasization") : ("")}`} disabled={disableSubmit} />
        )
    )
}

export default SubmitButton;