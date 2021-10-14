import React from "react";
import { Link, withRouter } from "react-router-dom";

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function ProjectOptions(props) {
    return (
        <ul className={`project-option-list ${props.className} ${props.hideInlineHeaderState ? ("hidden") : ("")}`}>{
            [
                // activity is for project activity so i should probably do a 
                // notification link for changes in projects concerning the user
                ["Activity", "bell"],
                ["Bugs", "bug"],
                ["People", "people-carry"],
                ["Settings", "cogs"]
            ].map((option, ind) => {
                const pathLower = option[0].toLowerCase();
                return (
                    <li className={`project-option-item ${props.match.params.path === pathLower ? ("active") : ("")}`} key={ind}>
                        <Link to={`/projects/${props.match.params.projectId}/${pathLower}`}>
                            <FontAwesomeIcon className="header-icon" icon={option[1]} />
                            <h1>{option[0]}</h1>
                        </Link>
                        <span className="text-hover">{
                            option[0]
                        }</span>
                    </li>
                )
            })
        }</ul>
    )
}

export default withRouter(ProjectOptions);