import React from "react";

import { Link } from "react-router-dom";

const ProjectItem = ({project}) => (
    <li>
        <Link to={`/projects/${project.id}/activity`}>
            <h1>{project.name}</h1>
            <p>{project.description}</p>
        </Link>
    </li>
);


export default ProjectItem;