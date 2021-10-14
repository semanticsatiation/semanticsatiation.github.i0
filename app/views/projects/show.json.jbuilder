json.details do 
    json.partial! "/projects/project", project: @project
    json.organizationId @project.organization_id
    json.ownerId @project.owner.id
    if @is_project_contributed
        json.projectContributerId @project.project_contributer_id
        json.joinDate @project.join_date
    end
end