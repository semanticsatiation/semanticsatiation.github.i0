import React from "react";
import PFPIcon from '../../../../src/default-profile-picture.png';

const Bugger = ({bugContributer, displayUsername = false}) => (
    <>
        <div className="user-avatar-small-container" title={bugContributer.username}>
            <img srcSet={bugContributer.photoURL === "https://bug-off-dev.s3.us-east-2.amazonaws.com/default-profile-picture.png" ? (PFPIcon) : (bugContributer.photoURL)} />
        </div>
        {
            displayUsername ? (
                <h1 className="bugger-username">{bugContributer.username}</h1>
            ) : (null)
        }
    </>
);

export default Bugger;