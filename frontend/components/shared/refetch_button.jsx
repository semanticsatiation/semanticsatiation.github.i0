import React from "react";

// components
import PageFiller from "../shared/page_filler";

function RefetchButton({refetchAction}) {
    return (
        <div className="page-refetch-button-container">
            <button type="button" onClick={e => refetchAction()}>
                <PageFiller string="Try Again" icon="sync" />
            </button>
        </div> 
    )
}

export default RefetchButton;