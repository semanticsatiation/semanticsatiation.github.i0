# THIS IS NEEDED FOR RENDERING THE USER IN root.html.erb
json.user do 
    json.partial! "/users/user.json.jbuilder", user: user
end

json.currentOrganizationId user.organization_ids.first