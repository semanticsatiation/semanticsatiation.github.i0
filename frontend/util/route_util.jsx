import React from "react";
import { Route, withRouter, Redirect } from "react-router-dom";
import { connect } from "react-redux";

const Auth = ({component: Component, exact, path, loggedIn}) => (
    <Route 
        exact={exact}
        path={path}
        render={(props) => (
            loggedIn ? (<Redirect to="/projects" />): (<Component {...props} />)
        )}
    />
);

const mapStateToProps = (state, ownProps) => ({
    loggedIn: Boolean(state.session.id)
});

export const AuthRoute = withRouter(
    connect(mapStateToProps, null)(Auth)
);

const Protect = ({component: Component, exact, path, loggedIn}) => (
    <Route
        exact={exact}
        path={path}
        render={(props) => (
            loggedIn ? (<Component {...props} />) : (<Redirect to="/login"/>)
        )}
    />
)

export const ProtectRoute = withRouter(
    connect(mapStateToProps, null)(Protect)
);




// I CAN'T MAKE THIS WORK SINCE PROPS AREN'T PASSED IN TIME FOR ME TO MAKE A PROPER VALIDATION
// DOSN'T ASYNC HANDLE THIS???

// const mapStateToPropsII = (state, ownProps) => ({
//     loggedIn: Boolean(state.session.id),
//     projects: state.entities.projects.allIds,
//     projectId: ownProps.match.params.projectId,
//     pathName: ownProps.match.params.path
// });


// this is to make sure users don't go to invalid route (invalid project id, invalid project option, etc...)
// const Verify = ({ component: Component, exact, path, loggedIn, projects, projectId, pathName }) => (
//     <Route
//         exact={exact}
//         path={path}
//         render={(props) => {
//             console.log(loggedIn, projects, projectId, pathName, loggedIn && projects.includes(parseInt(projectId)) && ["activity", "bugs", "people", "settings"].includes(pathName));
//             return loggedIn && projects.includes(parseInt(projectId)) && ["activity", "bugs", "people", "settings"].includes(pathName)
//             ? 
//             (<Component {...props} />) 
//             : 
//             (<Redirect to={"/projects"} />)
//         }}
//     />
// )

// export const VerifyRoute = withRouter(
//     connect(mapStateToPropsII, null)(Verify)
// );