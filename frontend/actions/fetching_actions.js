export const START_FETCHING_PROJECTS = "START_FETCHING_PROJECTS";
export const START_FETCHING_EXTRA_PROJECTS = "START_FETCHING_EXTRA_PROJECTS";
export const FAIL_PROJECTS_FETCH = "FAIL_PROJECTS_FETCH";
export const FAIL_EXTRA_PROJECTS_FETCH = "FAIL_EXTRA_PROJECTS_FETCH";
export const END_FETCHING_EXTRA_PROJECTS = "END_FETCHING_EXTRA_PROJECTS";
export const END_FETCHING_PROJECTS = "END_FETCHING_PROJECTS";

export const START_FETCHING_OBJECTS = "START_FETCHING_OBJECTS";
export const END_FETCHING_OBJECTS = "END_FETCHING_OBJECTS";

export const START_FETCHING_EXTRA_OBJECTS = "START_FETCHING_EXTRA_OBJECTS";
export const END_FETCHING_EXTRA_OBJECTS = "END_FETCHING_EXTRA_OBJECTS";

export const START_FETCHING_EXTRA_LAYER_OBJECTS = "START_FETCHING_EXTRA_LAYER_OBJECTS";
export const END_FETCHING_EXTRA_LAYER_OBJECTS = "END_FETCHING_EXTRA_LAYER_OBJECTS";

export const FAIL_EXTRA_LAYER_OBJECTS_FETCH = "FAIL_EXTRA_LAYER_OBJECTS_FETCH";
export const FAIL_EXTRA_OBJECTS_FETCH = "FAIL_EXTRA_OBJECTS_FETCH";
export const FAIL_OBJECTS_FETCH = "FAIL_OBJECTS_FETCH";

export const START_FETCHING_ORGANIZATIONS = "START_FETCHING_ORGANIZATIONS";
export const FAIL_ORGANIZATIONS_FETCH = "FAIL_ORGANIZATIONS_FETCH";

export const START_FETCHING_CURRENT_PROJECT = "START_FETCHING_CURRENT_PROJECT";
export const FAIL_CURRENT_PROJECT_FETCH = "FAIL_CURRENT_PROJECT_FETCH";


export const failProjectsFetch = () => ({
    type: FAIL_PROJECTS_FETCH
});

export const failExtraProjectsFetch = () => ({
    type: FAIL_EXTRA_PROJECTS_FETCH
});

export const startFetchingCurrentProject = () => ({
    type: START_FETCHING_CURRENT_PROJECT
});

export const startFetchingProjects = () => ({
    type: START_FETCHING_PROJECTS
});

export const startFetchingExtraProjects = () => ({
    type: START_FETCHING_EXTRA_PROJECTS
});

export const endProjectsFetch = () => ({
    type: END_FETCHING_PROJECTS
});

export const endExtraProjectsFetch = () => ({
    type: END_FETCHING_EXTRA_PROJECTS
});

export const failObjectsFetch = () => ({
    type: FAIL_OBJECTS_FETCH
});

export const startFetchingObjects = () => ({
    type: START_FETCHING_OBJECTS
});

export const startFetchingExtraObjects = () => ({
    type: START_FETCHING_EXTRA_OBJECTS
});

export const startFetchingExtraLayerObjects = () => ({
    type: START_FETCHING_EXTRA_LAYER_OBJECTS
});

export const endExtraObjectsFetch = () => ({
    type: END_FETCHING_EXTRA_OBJECTS
});

export const endExtraLayerObjectsFetch = () => ({
    type: END_FETCHING_EXTRA_LAYER_OBJECTS
});

export const failExtraObjectsFetch = () => ({
    type: FAIL_EXTRA_OBJECTS_FETCH
});

export const failExtraLayerObjectsFetch = () => ({
    type: FAIL_EXTRA_LAYER_OBJECTS_FETCH
});

export const startFetchingOrganizations = () => ({
    type: START_FETCHING_ORGANIZATIONS
});

export const failOrganizationsFetch = () => ({
    type: FAIL_ORGANIZATIONS_FETCH
});

export const failCurrentProjectFetch = () => ({
    type: FAIL_CURRENT_PROJECT_FETCH
});

export const endObjectsFetch = () => ({
    type: END_FETCHING_OBJECTS
});