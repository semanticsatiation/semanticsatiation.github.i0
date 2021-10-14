import React, {useState}  from "react";

// components
import ProjectFormContainer from "../projects/project_form_container";
import DeleteForm from "../shared/delete_form";


function Settings(props) {
    const [isFormExposed, setIsFormExposed] = useState(false);

    const extraProjectsFetch = (projectId = undefined) => {
        let ind = props.toBeSorted.findIndex((id) => id === projectId);

        let toBeSortedCopy  = [...props.toBeSorted];

        if (projectId && ind != -1) {
            toBeSortedCopy.splice(ind, 1);
        };

        return props.fetchExtraProjects({
            // when performing a GET request with an attached query, we need to encode it properly
            // so it isn't interpreted incorrectly by the backend
            
            url: `/organizations/${props.currentOrganizationId}/projects?off_set=${props.projectPage - 1}&[filter][string]=${encodeURIComponent(props.projectsFilter.trim())}&[sort][sort_by]=${props.sortBy}&[sort][to_be_sorted]=${toBeSortedCopy}&recalibrate`,
            recalibrate: true
        });
    }

    const deleteProject = () => (
        props.deleteProject({ 
                url: `/organizations/${props.currentOrganizationId}/projects/${props.currentProject.id}`,
                // adding the projectId so if we fail, we'll just use the provided projectId
                // to remove the project
                projectId: props.currentProject.id
        }).finally(
            () => {
                extraProjectsFetch(props.currentProject.id);
            }
        )
    )

    const leaveProject = () => (
        props.leaveProject({ 
                url: `/projects/${props.currentProject.id}/project_contributers/${props.currentProject.projectContributerId}`,
                projectId: props.currentProject.id
        }).finally(
            () => {
                extraProjectsFetch(props.currentProject.id);
            }
        )
    )

    return (
        <div className="option-container project-settings">
            <ProjectFormContainer type={props.isOwnerViewing ? ("update") : ("read")} extraProjectsFetch={extraProjectsFetch}/>

            <button className="delete-button" onClick={(e) => setIsFormExposed(true)}>{
                props.isOwnerViewing ? ("Delete Project") : ("Leave Project")
            }</button>

            {
                isFormExposed ? (
                    <DeleteForm 
                        deleteAction={props.isOwnerViewing ? (deleteProject) : (leaveProject)} 
                        newPath="/projects" 
                        closeForm={() => setIsFormExposed(false)} 
                        submitValue={props.isOwnerViewing ? (undefined) : ("leave")}
                        confirmationText={props.isOwnerViewing ? ("Confirm Project Deletion") : ("Confirm Project Exit")}
                    />
                ) : (null)
            }

        </div>
    )
}

export default Settings;