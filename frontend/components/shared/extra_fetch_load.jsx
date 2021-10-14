import React from "react";

// components
import Loading from "./loading";
import PageFiller from "./page_filler";

function ExtraFetchLoad({onFetchFailProperties, isLoad}) {
    return (
        onFetchFailProperties.isFail ? (
            <div className="extra-refetch-button-container">
                <button type="button" onClick={e => onFetchFailProperties.failedAction()}>
                    <PageFiller string="Try Again" icon="sync" />
                </button>
            </div>
        ) : (
            isLoad ? (
                <div className="extra-load-container">
                    <Loading size="medium-spinner" />
                </div>
            ) : (null)
        )
    )
}

export default ExtraFetchLoad;