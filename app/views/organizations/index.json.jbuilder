json.byId do
    @organizations.each do |organization|
        json.set! organization.id do
            json.partial! "/organizations/organization", organization: organization
        end
    end
end

json.allIds @organizations.map(&:id)
