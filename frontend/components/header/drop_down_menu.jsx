import React from "react";
import { Link } from 'react-router-dom';
import PFPIcon from '../../../src/default-profile-picture.png';

// components
import ThemeDropDown from "./theme_drop_down";

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function DropDownMenu(props) {
    const { username, photoURL, theme, id } = props.currentUser;
    const { updateUser } = props;

    return (
        <nav ref={props.dropDownRef} className={`drop-down-nav-container ${props.hideAvatarDropDown ? ("hidden") : ("")}`}>
            <ul className="drop-down-list">
                <li className="drop-down-list-item">
                    <Link to="/profile">
                        <div className="user-avatar-medium-container">
                            <img srcSet={photoURL === "https://bug-off-dev.s3.us-east-2.amazonaws.com/default-profile-picture.png" ? (PFPIcon) : (photoURL)} />
                        </div>
                        <span className="user-profile">
                            {/* need to make sure to truncate the username if it's too long? should i overflow: scroll? */}
                            {username.replace(/(.{8})..+/, "$1...")}
                            <p>configure profile</p>
                        </span>
                    </Link>
                </li>
                <hr />
                <li className={"drop-down-list-item"}>
                    <Link to="/notifications">
                        <FontAwesomeIcon className="setting-icon" icon="bell" />
                        <span>Notifications</span>
                    </Link>
                </li>
                <li className={"drop-down-list-item"}>
                    <Link to="/settings">
                        <FontAwesomeIcon className="setting-icon" icon="cog" />
                        <span>Organization Settings</span>
                    </Link>
                </li>
                <li className="drop-down-list-item" onClick={props.toggleThemeDropDown}>
                    <button className="theme-setting">
                        {/*  div is to keep style looking decent */}
                        <div>
                            <FontAwesomeIcon className="setting-icon" icon="paint-brush" />
                            <span>Themes</span>
                        </div>
                        <FontAwesomeIcon className={`setting-icon arrow ${props.hideThemeMenu ? ("") : ("rotate")}`} icon="arrow-circle-right" />
                        <ThemeDropDown theme={theme} updateUser={updateUser} hideThemeMenu={props.hideThemeMenu} currentUserId={id} />
                    </button>
                </li>
                <hr />
                <li className="drop-down-list-item" onClick={e => props.logOut()}>
                    <button type="button">
                        <FontAwesomeIcon className="setting-icon" icon="sign-out-alt" />
                        <span>Log Out</span>
                    </button>
                </li>
            </ul>
        </nav>
    )
}

export default DropDownMenu;