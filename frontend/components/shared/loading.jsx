import React from "react";

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function Loading({size}) {
    return (
        <div className={`loading-container ${size}`}>
            <FontAwesomeIcon icon="sync" className="icon-spin"/>
        </div>
    )
}

export default Loading;