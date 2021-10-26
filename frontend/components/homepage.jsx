import React from "react";

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// components
import ProjectFormContainer from "./projects/project_form_container";
import ProjectItem from "./projects/project_item";
import PageFiller from "./shared/page_filler";
import Loading from "./shared/loading";
import SortByOptions from "./shared/sort_by_options";
import ExtraFetchLoad from "./shared/extra_fetch_load";
import RefetchButton from "./shared/refetch_button";

// variables
import { CONTRIBUTED_PROJECTS } from "./shared/variables";

class HomePage extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;

        this.projectListRef = React.createRef();

        this.state = {
            showProjectForm: false,
            name: ""
        }

        this.showProjectForm = this.showProjectForm.bind(this);
        this.closeProjectForm = this.closeProjectForm.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.searchProjects = this.searchProjects.bind(this);
        this.clearSearchField = this.clearSearchField.bind(this);
        this.fetchRecent = this.fetchRecent.bind(this);
        this.fetchProjects = this.fetchProjects.bind(this);
        this.fetchExtraProjects = this.fetchExtraProjects.bind(this);
    }

    componentDidMount() {
        // only fetch new projects if there is no property called totalProjects on state.entities.projects;
        // if totalProjects is present, projects were already fetched so don't refetch projects 
        // (i could also check the length of all allIds for state.entities.projects)
        if (!this.props.totalProjects) {
            this.fetchProjects().then(
                () => {
                    // if we are coming from creating a new project from a different organization, 
                    // don't head straight to the new project until we have fetched the projects for the current organization 
                    // (heading straight to the new project will cancel the fetchProjects request)
                    if (this.props.location.hasOwnProperty("projectFetch") && this.projectListRef.current) {
                        // && this.projectListRef.current is for when we head to a new project that was made or 
                        // a recent project that was selected but the user decided to log off before we receive said project so 
                        // we prevent a signed out user from receiving a project when they aren't logged in or not on the projects list page
                        this.props.location.projectFetch();
                    }
                }
            );
        } else {
            if (!["", undefined].includes(this.props.projectsFilter)) {
                this.setState({
                    name: this.props.projectsFilter
                });
            }

            this.resetScroll();
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.currentOrganization.id != this.props.currentOrganization.id) {
            this.setState({
                name: ""
            });

            this.fetchProjects({ filter: "", sortBy: "created" }, true).then(
                () => {
                    if (["projectFetch", "newOrgRecentFetch"].some((fetchType) => this.props.location.hasOwnProperty(fetchType)) && this.projectListRef.current) {
                        if (this.props.location.hasOwnProperty("projectFetch")) {
                            this.props.location.projectFetch();
                        } else {
                            this.props.location.newOrgRecentFetch();
                        }
                    }
                }
            );
            // condition for when we filter projects but the new set of projects still require the infinite scrolling event listener
            // (all this happens while staying on the same organization)
        } else if (prevProps.currentOrganization.id === this.props.currentOrganization.id && (prevProps.projectsFilter != this.props.projectsFilter || prevProps.sortBy != this.props.sortBy)) {
            this.resetScroll(true);
        } else if (this.props.location.hasOwnProperty("currentOrgRecentFetch") && this.projectListRef.current) {
            this.props.location.currentOrgRecentFetch();
        }
    }

    componentWillUnmount() {
        clearTimeout(this.timeout);

        if (this.projectListRef.current) {
            this.removeScroll();
        }
    }

    resetScroll(scrollToTop = false) {
        const addScroll = () => this.projectListRef.current.addEventListener("scroll", this.handleScroll);

        // this.projectListRef.current is for when an organization does not have any projects
        // only keep fetching extra projects if there are some left
        if (this.projectListRef.current && !this.allItemsFetched()) {
            // don't add eventListener if all projects already fetched or there aren't projects for the current organiztion

            if (scrollToTop) {
                this.projectListRef.current.scrollTo(0, 0);
            }
            
            addScroll();
        }
    }

    removeScroll() {
        this.projectListRef.current.removeEventListener("scroll", this.handleScroll);
    }

    fetchRecent(project) {
        if (!this.props.projectsBeingFetched) {
            let routerState = {
                pathname: "/projects",
            };

            let callback = () => {
                const { organizationId, ownerId, isContributed, contributedId, ...simplifiedProject } = project;

                this.props.receiveProject(simplifiedProject, "recent");

                this.props.history.push({
                    pathname: `/projects/${project.id}/activity`,
                });
            };

            const fetchPath = (condition, organizationId) => {
                if (condition) {
                    routerState.newOrgRecentFetch = callback;

                    this.props.history.replace(routerState);

                    this.props.changeOrganization(organizationId);
                } else {
                    routerState.currentOrgRecentFetch = callback;

                    this.props.history.replace(routerState);
                }
            }

            if (project.isContributed) {
                fetchPath(project.contributedId != this.props.currentOrganization.id, project.contributedId);
            } else {
                fetchPath(project.organizationId != this.props.currentOrganization.id, project.organizationId);
            }
        }
    }

    allItemsFetched() {
        return this.props.totalSessionProjects >= this.props.totalProjects
    }

    handleScroll() {
        if (!this.props.extraProjectsBeingFetched) {
            const pageOffset = this.projectListRef.current.scrollTop + this.projectListRef.current.clientHeight;
            if (pageOffset >= this.projectListRef.current.scrollHeight) {
                this.fetchExtraProjects().then(
                    () => {
                        if (this.allItemsFetched()) {
                            this.removeScroll();
                        }
                    }
                );
            }
        }

    }

    fetchProjects(options = {}, scrollToTop = false) {
        if (!options.hasOwnProperty("filter")) {
            options.filter = this.state.name;
        }

        if (!options.hasOwnProperty("sortBy")) {
            options.sortBy = this.props.sortBy;
        }

        return this.props.filterProjects({
            // when performing a GET request with an attached query, we need to encode it properly
            // so it isn't interpreted incorrectly by the backend
            url: `/organizations/${this.props.currentOrganization.id}/projects?[filter][string]=${encodeURIComponent(options.filter.trim())}&[sort][sort_by]=${options.sortBy}`,
            filter: options.filter,
            sortBy: options.sortBy
        }).then(
            () => this.resetScroll(scrollToTop),
            (errors) => errors
        );
    }
    
    fetchExtraProjects() {
        return this.props.fetchExtraProjects({
            // when performing a GET request with an attached query, we need to encode it properly
            // so it isn't interpreted incorrectly by the backend
            url: `/organizations/${this.props.currentOrganization.id}/projects?off_set=${this.props.projectPage}&[filter][string]=${encodeURIComponent(this.state.name.trim())}&[sort][sort_by]=${this.props.sortBy}&[sort][to_be_sorted]=${this.props.toBeSorted}`,
            recalibrate: false
        });
    }

    showProjectForm(event) {
        // since the form is inside the element that will house it, we will need to 
        // worry about when the actual list item is being clicked on vs when the user
        // is clicking on an input inside the form inside the list item
        if (event.target.classList.contains("project-form-container")) {
            this.setState({
                showProjectForm: true
            });
        }
    }

    closeProjectForm(event) {
        if (event) {
            event.preventDefault();
        }
        // code above prevents the following error from showing up:
        // Form submission canceled because the form is not connected

        this.setState({
            showProjectForm: false
        });
    }

    searchProjects(event) {
        const searchValue = event.target.value;

        this.setState({ name: searchValue });

        this.timeout;
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => this.fetchProjects({ sortBy: "created" }), 350);
    }

    clearSearchField() {
        if (this.state.name != "") {
            // clearing when search field is already empty
            // messes up the fetchExtraProjects event listener
            // so only clear when necessary
            this.setState({ name: "" });

            this.fetchProjects({ filter: "", sortBy: "created" });
        }
    }

    render() {
        const noContributedProjects = this.props.currentOrganization.name === CONTRIBUTED_PROJECTS && this.props.allIds.length <= 0;

        const pageFiller = ![undefined, ""].includes(this.props.projectsFilter) ? (<PageFiller string="No projects were found!" icon="file-excel" />) : (<PageFiller string="Any project you contribute to goes here!" icon="hand-holding-medical" />);

        const isRecentProjectsPresent = this.props.recentProjects.length > 0;
        return (
            <div className="home-page-container">
                <header className="project-list-header">
                    <div>
                        <h1>Projects</h1>
                        <div className="search-project-container">
                            <input
                                className="input-field"
                                type="text"
                                name="search-project"
                                id="search-project"
                                placeholder="search for a project"
                                value={this.state.name}
                                onChange={this.searchProjects}
                            />

                            <button className="exit-icon-button" type="button">
                                <FontAwesomeIcon className="exit-icon" icon="times-circle" onClick={this.clearSearchField} />
                            </button>
                        </div>
                    </div>
                    <div>
                        {
                            isRecentProjectsPresent ? (
                                <>
                                    <h1>Recent Projects</h1>
                                    <ul className="recent-projects">
                                        {
                                            this.props.recentProjects.map(project => (
                                                <li className="recent-projects-item" key={project.id} onClick={e => this.fetchRecent(project)}>
                                                    <button type="button">{project.name}</button>
                                                </li>
                                            ))
                                        }
                                    </ul>
                                </>
                            ) : (null)
                        }
                    </div>
                </header>
                {
                    this.props.projectsFetchFailed ? (
                        <RefetchButton refetchAction={this.fetchProjects} />
                    ) : (
                        this.props.projectsBeingFetched ? (<Loading size="large-spinner" />) : (
                            noContributedProjects ? (
                                pageFiller
                            ) : (
                                <nav className={`project-list-nav ${isRecentProjectsPresent ? ("project-list-height-decrease") : ("")}`}>
                                    <SortByOptions onClickAction={(sortBy) => this.fetchProjects({ sortBy: sortBy })} sortBy={this.props.sortBy} />

                                    <ul ref={this.projectListRef} className={`project-list ${this.state.showProjectForm ? ("hide-content expand-height") : ("")}`}>
                                        {
                                            this.props.currentOrganization.name === CONTRIBUTED_PROJECTS ? (null) : (
                                                <li className="project-form-container" onClick={this.showProjectForm}>
                                                    {this.state.showProjectForm ? (<ProjectFormContainer closeProjectForm={this.closeProjectForm} />) : (null)}
                                                    <div>
                                                        {/* this will bring up the new project form */}
                                                        <span>
                                                            <FontAwesomeIcon icon="plus-circle" />
                                                        </span>
                                                        <h1>New Project</h1>
                                                    </div>
                                                </li>
                                            )
                                        }
                                        {
                                            this.props.allIds.map(id => (
                                                <ProjectItem
                                                    project={this.props.getProject(id)}
                                                    key={id}
                                                />
                                            ))
                                        }
                                    </ul>

                                    <ExtraFetchLoad
                                        onFetchFailProperties={{ isFail: this.props.extraProjectsFetchFailed, failedAction: this.fetchExtraProjects }}
                                        isLoad={this.props.extraProjectsBeingFetched}
                                    />
                                </nav >
                            )
                        )
                    )
                }
            </div>
        )
    }
}

export default HomePage;