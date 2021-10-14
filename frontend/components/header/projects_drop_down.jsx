import React from "react";
import { Link } from "react-router-dom";

// components
import Loading from "../shared/loading";
import PageFiller from "../shared/page_filler";
import { CONTRIBUTED_PROJECTS } from "../shared/variables";

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class ProjectsDropDown extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;

        this.organizationsListRef = React.createRef();
        this.projectsListRef = React.createRef();

        this.selectedProjectRef = React.createRef();
        this.selectedOrganizationRef = React.createRef();
    }

    componentDidMount() {
        const selectedProject = this.selectedProjectRef.current;

        this.selectedOrganizationRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // scrollIntoView can't be used for multiple elements at the same time, figure out other solution
        if (this.projectsListRef.current && selectedProject) {
            selectedProject.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    render() {
        return (
            <nav>
                <ul className="projects-drop-down-list">
                    <li className="organizations-section">
                        <div>
                            <h1>Organizations</h1>
                            <ul ref={this.organizationsListRef} className="organizations-list">{
                                this.props.organizations.map(organization => {
                                    const isSelectedOrganization = this.props.currentOrganization.id === organization.id;

                                    return (
                                        < li
                                            ref={isSelectedOrganization ? (this.selectedOrganizationRef) : (null)}
                                            className={`organization-list-item ${isSelectedOrganization ? ("selected") : ("")}`}
                                            key={organization.id}
                                            onClick={this.props.currentOrganization.id === organization.id || this.props.projectsBeingFetched ? (null) : (() => this.props.changeOrganization(organization.id))}
                                        >
                                            <Link to="/projects">{
                                                organization.name
                                            }</Link>
                                        </li>
                                    )
                                })
                            }</ul>
                        </div>
                        <footer>
                            <div className="project-list-item" onClick={this.props.showOrganizationForm}>
                                <span>
                                    <FontAwesomeIcon className="header-icon" icon="building" />
                                </span>
                                <span>
                                    <FontAwesomeIcon className="header-icon" icon="plus" />
                                </span>

                                <h1>New Organization</h1>
                            </div>
                        </footer>
                    </li>
                    <li className="projects-section">
                        <div>
                            <h1>Projects</h1>
                            {                        
                                this.props.projectsBeingFetched ? (
                                    <Loading size="small-spinner"/>
                                ) : (
                                    this.props.allIds.length > 0 ? (
                                        <ul ref={this.projectsListRef} className="projects-list">{
                                            this.props.allIds.map(id => {
                                                const project = this.props.getProject(id);
                                                const isSelectedProject = this.props.currentProjectId === project.id;
                                                return (
                                                    <li 
                                                        ref={isSelectedProject ? (this.selectedProjectRef) : (null)} 
                                                        className={`project-list-item ${isSelectedProject ? ("selected") : ("")}`} 
                                                        key={project.id}
                                                    >
                                                        <Link to={`/projects/${project.id}/activity`}>{
                                                            project.name
                                                        }</Link>
                                                    </li>
                                                )
                                            })
                                        }
                                            {
                                                this.props.extraProjectsBeingFetched ? (<Loading size="small-spinner" />) : (null)
                                            }
                                        </ul>
                                    ) : (
                                        this.props.currentOrganization.name === CONTRIBUTED_PROJECTS ? (
                                            ![undefined, ""].includes(this.props.projectsFilter) ? (<PageFiller string="No projects!" icon="file-excel" />) : (<PageFiller string="Go contribute!" icon="hand-holding-medical" />)
                                        ) : (
                                            <PageFiller string = "Go create!" icon="folder-plus" />
                                        )
                                    )
                                )
                            }
                        </div>
                        <footer>
                            <div className="project-list-item" onClick={this.props.showProjectForm}>
                                <span>
                                    <FontAwesomeIcon className="header-icon" icon="folder-open" />
                                </span>
                                <span>
                                    <FontAwesomeIcon className="header-icon" icon="plus" />
                                </span>

                                <h1>New Project</h1>
                            </div>
                        </footer>
                    </li>
                </ul>
            </nav>
        )
    }
}

export default ProjectsDropDown;