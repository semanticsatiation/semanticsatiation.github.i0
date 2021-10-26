import React from "react";
import { Switch, Redirect } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "./global_styles";
import { 
    defaultTheme, darkTheme, creamy, 
    blueberryTheme, fireFlyTheme, halloweenTheme 
} from "./themes";


// make these icons available globally in the app
import { library } from '@fortawesome/fontawesome-svg-core';
import { 
    faTimesCircle, faUserPlus, faUser,
    faEnvelope, faPlusCircle, faSignOutAlt,
    faCog, faPaintBrush, faArrowCircleRight,
    faBuilding, faCaretDown, faBell,
    faBug, faCogs, faPeopleCarry,
    faEyeSlash, faEye, faCameraRetro,
    faHandHoldingMedical, faFolderOpen, faPlus,
    faUsersSlash, faSync, faFolderPlus,
    faFileExcel, faUserMinus, faTrashAlt,
    faTimes, faSortAlphaDown, faSortAlphaDownAlt,
    faCalendarAlt, faQuestionCircle, faSortUp, 
    faSortDown, faGripLines, faFilter,
    faSearch, faHistory, faArrowCircleDown,
    faDizzy, faArrowRight, faArrowLeft,
    faComments, faArrowDown, faArrowUp,
    faAngleDoubleRight, faBellSlash
} from '@fortawesome/free-solid-svg-icons';

library.add(
    faTimesCircle, faUserPlus, faUser,
    faEnvelope, faPlusCircle, faSignOutAlt,
    faCog, faPaintBrush, faArrowCircleRight,
    faBuilding, faCaretDown, faBell,
    faBug, faCogs, faPeopleCarry,
    faEyeSlash, faEye, faCameraRetro,
    faHandHoldingMedical, faFolderOpen, faPlus,
    faUsersSlash, faSync, faFolderPlus,
    faFileExcel, faUserMinus, faTrashAlt,
    faTimes, faSortAlphaDown, faSortAlphaDownAlt,
    faCalendarAlt, faQuestionCircle, faSortUp, 
    faSortDown, faGripLines, faFilter,
    faSearch, faHistory, faArrowCircleDown,
    faDizzy, faArrowRight, faArrowLeft,
    faComments, faArrowDown, faArrowUp,
    faAngleDoubleRight, faBellSlash
);

// API Util files
import {ProtectRoute, AuthRoute} from "../util/route_util";

// Components
import HeaderContainer from "../components/header/header_container";
import ProjectNavContainer from "../components/header/project_nav_container";
import SignUpFormContainer from "../components/users/signup_form_container";
import LoginFormContainer from "../components/users/login_form_container";
import UserProfileContainer from "../components/users/user_profile_container";
import HomePageContainer from "../components/homepage_container";
import OrganizationFormContainer from "./header/organization_form_container";
import RefetchButton from "./shared/refetch_button";
import NotificationsContainer from "./users/notifications/notifications_container";
import ErrorListItem from "./shared/error_list_item";
import Loading from "./shared/loading";

function App(props) {
    // Adding theme steps: add to here, theme.jsx, and theme_drop_down.jsx, and the User model in ensure_valid_theme
    const stringToTheme = {
        "Default": [defaultTheme, '#002b36'],
        "Creamy": [creamy, '#19181a'],
        "Dark": [darkTheme, '#0d171d'],
        "Blueberry": [blueberryTheme, '#011B44'],
        "FireFly": [fireFlyTheme, '#191919'],
        "Halloween": [halloweenTheme, '#1f0333']
    }

    const NotFoundRedirect = () => (
        props.loggedIn ? (<Redirect to='/projects' />): (<Redirect to='/login' />)
    );

    return (
        <ThemeProvider theme={stringToTheme[props.theme][0]}>
            <>
                <GlobalStyles />
                {/* style is here to prevent the white flash when refreching the page */}
                <div className="app" style={{ backgroundColor: stringToTheme[props.theme][1] }}>
                    {
                        props.loggingOut ? (
                            <Loading size="large-spinner" />
                        ) : (null)
                    }
                    <header className="app-header-container">
                        <ProtectRoute path="/" component={HeaderContainer}/>
                    </header>

                    {
                        props.organizationsFetchFailed ? (
                            <RefetchButton refetchAction={props.fetchOrganizations} />
                        ) : (null)
                    }
                    
                    <Switch>
                        {/* signed in users shouldn't be able to go to any of the AuthRoutes */}
                        <AuthRoute path="/signup" component={SignUpFormContainer} />
                        <AuthRoute path="/login" component={LoginFormContainer} />


                        <ProtectRoute
                            // this Route will ONLY render the component if we are visiting the 
                            // following url format 
                            exact path={["/projects/:projectId/:path", "/projects/:projectId/:path/:bugId"]}
                            component={ProjectNavContainer}
                        />

                        {
                            props.organizationsFetchFailed ? (
                                null
                            ) : (
                                props.organizationsBeingFetched ? (null) :
                                (<ProtectRoute exact path="/projects" component={HomePageContainer}/>)
                            )

                        }

                        <ProtectRoute exact path="/notifications" component={() => <NotificationsContainer />} />
                        <ProtectRoute exact path="/settings" component={() => <OrganizationFormContainer type="Update" />} />


                        {/* users who aren't signed in shouldn't be able to go to any of the ProtectRoutes */}
                        {/* this should protect anything having to do with /profile like /profile/update or /profile/fjreongesjo */}
                        <ProtectRoute exact path="/profile" component={UserProfileContainer} />
                        
                        <NotFoundRedirect />
                    </Switch>
                </div>
            </>
        </ThemeProvider>
    );
}

export default App;