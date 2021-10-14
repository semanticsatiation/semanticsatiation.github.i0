import React from "react";
import { withRouter, Redirect } from "react-router-dom";

// api
import { endLastGetRequest } from "../../util/shared_util";

// components
import BugsContainer from "../projects/bugs/bugs_container";
import PeopleContainer from "../projects/people/people_container";
import SettingsContainer from "../projects/settings_container";
import BugContainer from "../projects/bugs/bug_container";
import RefetchButton from "../shared/refetch_button";
import ActivitiesContainer from "../projects/activities/activities_container";

// SERIOUS
// The way this component handles invalid ids and paths...
// i don't like it:
// i need to put this.validPath() for all compnent FUNCTIONS so it doesn't crash the app
class ProjectNav extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;

        this.fetchProject = this.fetchProject.bind(this);
    }

    componentDidMount() {
        if (this.validPath()) {
            this.fetchProject();
        }
    }

    componentDidUpdate(prevProps) {
        if (this.validPath() && prevProps.match.params.projectId != this.props.match.params.projectId) {
            this.fetchProject();
        }
    }

    componentWillUnmount() {
        endLastGetRequest();

        this.props.removeCurrentProject();
    }

    fetchProject() {
        this.props.fetchFullProject({ url: `/organizations/${this.props.currentOrganizationId}/projects/${this.props.match.params.projectId}` });
    }

    pathInd(path) {
        return {
            "activity": [0, ActivitiesContainer],
            "bugs": [1, BugsContainer],
            "people": [2, PeopleContainer],
            "settings": [3, SettingsContainer]
        }[path];
    }

    validPath() {
        return (this.props.projectIds.includes(parseInt(this.props.match.params.projectId)) || this.props.bugIds.includes(parseInt(this.props.match.params.bugId))) && Boolean(this.pathInd(this.props.match.params.path));
    }

    render() {
        const currentProjectId = this.props.currentProjectId;
        const bugId = this.props.match.params.bugId;
        let CompName;

        if (this.validPath()) {
            CompName = this.pathInd(this.props.match.params.path)[1];
        }

        return (
            this.props.currentProjectFetchFailed ? (
                <RefetchButton refetchAction={this.fetchProject} />
            ) : (
                this.props.currentProjectBeingFetched ? (null) : (
                    <div className={`${this.props.isHeaderStacked ? ("increase-height") : ("decrease-height")}`}>{
                        CompName ? (
                            currentProjectId && this.props.match.params.projectId === currentProjectId.toString() ? (
                                Boolean(bugId) && /^\d+$/.test(bugId) ? (
                                    <BugContainer currentProjectId={currentProjectId} bugId={bugId} isCommentOwner={(commentSubmitterId) => commentSubmitterId === this.props.currentUserId} isProjectOrObjectOwner={(...objectOwnerIds) => [...objectOwnerIds, this.props.currentProjectOwnerId].some((id) => id === this.props.currentUserId)} />
                                ) : (
                                    <CompName />
                                ) 
                            ) : (null)
                        ) : (<Redirect to="/projects" />)
                    }</div>
                )
            )
        )
    }
}

export default withRouter(ProjectNav);