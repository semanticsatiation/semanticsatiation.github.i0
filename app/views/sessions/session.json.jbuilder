json.user do 
    json.partial! "/users/user.json.jbuilder", user: @user
end

json.currentOrganizationId @user.organization_ids.first