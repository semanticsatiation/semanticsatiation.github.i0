import React from "react";
import { Link, Route } from "react-router-dom";


// components
import DropDownMenu from "./drop_down_menu";
import ProjectHeaderNav from "./project_header_nav";
import ProjectsDropDownContainer from "./projects_drop_down_container";
import ProjectFormContainer from "../projects/project_form_container";
import Loading from "../shared/loading";
import ProjectOptions from "./project_options";
import OrganizationFormContainer from "./organization_form_container";

// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


class Header extends React.Component {
    constructor(props) {
        super(props);

        this.props = props;

        this.state = {
            hideProjectsDropDown: true,
            hideAvatarDropDown: true,
            hideThemeMenu: true,
            hideInlineHeader: false,
            showProjectForm: false,
            showOrganizationForm: false,
            currentInt: undefined
        }
        
        this.dropDownContainerRef = React.createRef();
        this.avatarRef = React.createRef();
        this.inlineHeaderParentRef = React.createRef();

        this.toggleProjectsDropDown = this.toggleProjectsDropDown.bind(this);
        this.toggleAvatarDropDown = this.toggleAvatarDropDown.bind(this);
        this.toggleThemeDropDown = this.toggleThemeDropDown.bind(this);
        this.showProjectForm = this.showProjectForm.bind(this);
        this.closeProjectForm = this.closeProjectForm.bind(this);
        this.showOrganizationForm = this.showOrganizationForm.bind(this);
        this.closeOrganizationForm = this.closeOrganizationForm.bind(this);
        this.hideInlineHeader = this.hideInlineHeader.bind(this);
        this.showInlineHeader = this.showInlineHeader.bind(this);
        this.logOut = this.logOut.bind(this);
    }

    componentDidMount() {
        this.props.fetchOrganizations();

        let currentGetRequest = new AbortController();
        let currentGetSignal = currentGetRequest.signal;

        this.setState({
            currentInt: setInterval(() => {
                const getWithTimeout = async () => {
                    currentGetRequest.abort();
                
                    currentGetRequest = new AbortController();
                    currentGetSignal = currentGetRequest.signal;
                
                    let aborted;
                    let timedOut;
                
                    currentGetSignal.onabort = () => {
                        aborted = true;
                    }

                    const timeout = setTimeout(() => {
                        timedOut = true;
                        currentGetRequest.abort();
                    }, 8000);
                
                    try {
                        const response = await fetch("/organizations", {
                            beforeSend: (xhr) => xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content')),
                            headers: {
                                "Accept": 'application/json',
                                'Content-Type': 'application/json',
                                'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
                            },
                            method: "GET",
                            signal: currentGetSignal,
                        });

                        const json = await response.json();
                
                        if (response.ok) {
                            return Promise.resolve(json);
                        }
                
                        // when there are validation errors, we head here
                        throw json;
                    } catch (errors) {
                        let finalErrors = errors;
                
                        if (aborted) {
                            if (timedOut) {
                                finalErrors = ['Response timed out'];
                            } else {
                                console.log(errors);
                                finalErrors = [];
                            }
                        }
                
                        return Promise.reject({ errors: finalErrors, aborted: aborted, timedOut: timedOut });
                    } finally {
                        clearTimeout(timeout);
                    }
                }

                getWithTimeout().then(
                    (successful) => {
                    }, 
                    (errors) => {
                        const appError = errors.errors.app;

                        // if the session token changes on the backend, log the current user out 
                        if (appError !== undefined && appError[0] === "You must be signed in!") {
                            this.props.logOut();
                        }
                    }
                );
            }, 3000)}
        );
    }

    componentDidUpdate() {
        if (!this.dropDownProjectsRef) {
            // componentDidMount does not notice dropDownProjectsRef since it renders too late
            // waiting for all organizations to be fetched first
            this.dropDownProjectsRef = React.createRef();
        }

    }

    componentWillUnmount() {
        clearInterval(this.state.currentInt);
        
        this.setState({
            currentInt: undefined
        });
    }
    
    hideInlineHeader() {
        this.setState({
            hideInlineHeader: true
        });

        this.props.updateHeaderFormat(true);
    }

    showInlineHeader() {
        this.setState({
            hideInlineHeader: false
        });

        this.props.updateHeaderFormat(false);
    }

    toggleProjectsDropDown(event) {
        event.preventDefault();

        this.setState({
            hideProjectsDropDown: !this.state.hideProjectsDropDown
        });

        this.listenForProjectsDropDownOffClick();
    }

    listenForProjectsDropDownOffClick() {
        const hideMenu = (event) => {
            const currentElement = event.target;
            const isClickInside = this.dropDownProjectsRef.current.contains(currentElement);

            if (!isClickInside) {
                this.setState({
                    hideProjectsDropDown: true
                });
            }
        }

        document.addEventListener("click", hideMenu, { once: true });
    }

    toggleAvatarDropDown(event) {
        event.preventDefault();
        if (!event.target.classList.contains("theme-setting")) {
            // close the drop down if we click off of it (this.listenForAvatarDropDownOffClick())
            // or we aren't clicking on the themes list item in the drop down
            this.setState({
                hideAvatarDropDown: !this.state.hideAvatarDropDown
            });
            // toggle the parent drop down menu
            if (!this.state.hideAvatarDropDown) {
                // if the drop down menu is about to close (true), make sure to 
                // always close the theme drop down menu
                this.setState({
                    hideThemeMenu: true
                });
            }
        }
        
        this.listenForAvatarDropDownOffClick();
    }

    toggleThemeDropDown() {
        this.setState({
            hideThemeMenu: !this.state.hideThemeMenu
        });
        // toggle the theme drop down menu
    }

    listenForAvatarDropDownOffClick() {
        const hideMenu = (event) => {
            const currentElement = event.target;

            // Note: we're accessing "current" to get the DOM node
            const isClickInside = this.avatarRef.current === currentElement || this.dropDownContainerRef.current.contains(currentElement);
            // this.avatarRef === currentElement is for when the small avatar
            // is clicked to trigger the drop down menu; we need to make sure that it is considered part of the drop down menu
            // this is to prevent the drop down from opening up unless the user clicks on an element that is not the avatar

            // if the user clicks outside the drop down
            if (!isClickInside) {
                this.setState({
                    hideAvatarDropDown: true,
                    hideThemeMenu: true
                });
                // theme drop down === closed if hideAvatarDropDown === true
            }
        }

        document.addEventListener("click", hideMenu, { once: true });
        // this makes sure the event listener only occurs once and then 
        // removes itself from the element until it is attached again
    }

    showOrganizationForm() {
        this.setState({
            showOrganizationForm: true
        });
    }

    closeOrganizationForm() {
        this.setState({
            showOrganizationForm: false
        });
    }

    showProjectForm() {
        this.setState({
            showProjectForm: true
        });
    }

    closeProjectForm() {
        this.setState({
            showProjectForm: false
        });
    }

    logOut() {
        if (!this.props.loggingOut) {
            this.props.logOut();
        }
    }

    render() {
        let { username, photoURL } = this.props.currentUser;

        let name;

        if (this.props.currentOrganization) {
            name = this.props.currentOrganization.name;
        }

        username = username.length > 8 ? (`${username.substring(0, 8)}...`) : (username);

        return (
            <div className="app-header">
                <nav>
                    <ul className="header-nav-list">
                        <li>
                            <Link to="/projects">
                                <img className="small-app-logo" src={"https://bug-off-public.s3.us-east-2.amazonaws.com/bug_off_logo.svg"} alt="BugOff Logo" />
                            </Link>
                            {
                                this.props.organizationsFetchFailed ? (null) : (
                                    !this.props.currentOrganization ? (<Loading size="medium-spinner" />) : (
                                        <button ref={this.dropDownProjectsRef} className="projects-drop-down" onClick={this.toggleProjectsDropDown}>
                                            <h1>
                                                <FontAwesomeIcon className="header-icon" icon="building" />
                                                <span>{name}</span>
                                            </h1>
                                            <div>
                                                {
                                                    this.props.currentProjectFetchFailed ? (<h1>...</h1>) : (
                                                        this.props.currentProjectBeingFetched ? (<Loading size="smallest-spinner" />)
                                                        :
                                                        (<h1>{this.props.currentProject.name}</h1>)
                                                    )
                                                }
                                                <FontAwesomeIcon className="header-icon" icon="caret-down" />
                                            </div>
                                            {
                                                this.state.hideProjectsDropDown ? (null) : (
                                                    <ProjectsDropDownContainer
                                                        changeOrganization={this.props.receiveCurrentOrganization}
                                                        showProjectForm={this.showProjectForm}
                                                        showOrganizationForm={this.showOrganizationForm}
                                                    />
                                                )
                                            }
                                        </button>
                                    )
                                )
                            }
                        </li>
                        <li ref={this.inlineHeaderParentRef}>
                            {
                                this.props.currentProject.id && !this.props.currentProjectBeingFetched && !this.props.currentProjectFetchFailed ? (
                                    <Route
                                        // this Route will ONLY render the component if we are visiting the 
                                        // following url format 
                                        path="/projects/:projectId/:path"
                                        render={
                                            () => <ProjectHeaderNav
                                                fetchingProject={this.props.currentProjectBeingFetched}
                                                hideInlineHeaderState={this.state.hideInlineHeader}
                                                showInlineHeader={this.showInlineHeader}
                                                hideInlineHeader={this.hideInlineHeader}
                                                inlineHeaderParentRef={this.inlineHeaderParentRef.current}  
                                                className="inline-header-options"
                                            />
                                        }
                                    />
                                ) : (
                                    null
                                )
                            }
                        </li>
                        <li className="avatar-drop-down" onClick={this.toggleAvatarDropDown}>
                            <div className="user-avatar-small-container">
                                <img ref={this.avatarRef} srcSet={photoURL} />
                            </div>
                            <DropDownMenu
                                dropDownRef = {this.dropDownContainerRef}
                                hideAvatarDropDown={this.state.hideAvatarDropDown}
                                toggleThemeDropDown={this.toggleThemeDropDown}
                                hideThemeMenu={this.state.hideThemeMenu}
                                currentUser={this.props.currentUser}
                                logOut={this.logOut}
                                updateUser={this.props.updateUser}
                            />
                        </li>
                    </ul>
                </nav>
                {
                    this.props.currentProject.id && this.state.hideInlineHeader && !this.props.currentProjectBeingFetched && !this.props.currentProjectFetchFailed ? (
                        <Route
                            // this Route will ONLY render the component if we are visiting the 
                            // following url format 
                            path="/projects/:projectId/:path"
                            render={
                                () => <ProjectOptions className="lower-header-options" />
                            }
                        />
                    ) : (
                        null
                    )
                }
                {this.state.showProjectForm ? (<ProjectFormContainer isBoxxed={true} closeProjectForm={this.closeProjectForm} />) : (null)}
                {this.state.showOrganizationForm ? (<OrganizationFormContainer closeOrganizationForm={this.closeOrganizationForm} type="Create" />) : (null)}
            </div>
        )
    }
}

export default Header;