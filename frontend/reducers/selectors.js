import { CONTRIBUTED_PROJECTS } from "../components/shared/variables";

export const getCurrentOrganization = (state) => state.entities.organizations.byId[state.session.currentOrganizationId];

export const arrayifyOrganizations = (state) => Object.values(state.entities.organizations.byId);

export const arrayifyOrganizationsBlockContributed = (state) => Object.values(state.entities.organizations.byId).filter(org => org.name != CONTRIBUTED_PROJECTS);