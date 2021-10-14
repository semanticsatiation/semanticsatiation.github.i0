import { combineReducers } from "redux";

// reducers
import usersReducer from "./users_reducer";
import projectsReducer from "./projects_reducer";
import OrganizationsReducer from "./organizations_reducer";
import notificationsReducer from "./notifications_reducer";

const entitiesReducer = combineReducers({
    notifications: notificationsReducer,
    users: usersReducer,
    projects: projectsReducer,
    organizations: OrganizationsReducer,
});

export default entitiesReducer;