import React from "react";

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function PageFiller({string, icon}) {
    return (
        <div className="page-filler-container">
            <p>
                <span><FontAwesomeIcon icon={icon} /></span>
                {string}
            </p>
        </div>
    )
}

export default PageFiller;