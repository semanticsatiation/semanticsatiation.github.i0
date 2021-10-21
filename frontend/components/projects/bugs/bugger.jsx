import React from "react";

const Bugger = ({bugContributer, displayUsername = false}) => (
    <>
        <div className="user-avatar-small-container" title={bugContributer.username}>
            <img srcSet={bugContributer.photoURL} />
        </div>
        {
            displayUsername ? (
                <h1 className="bugger-username">{bugContributer.username}</h1>
            ) : (null)
        }
    </>
);

export default Bugger;