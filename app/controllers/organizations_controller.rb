class OrganizationsController < ApplicationController
    before_action :prevent_organization_modification!, :must_be_organization_owner!, only: [:update, :destroy]

    def index
        @organizations = current_user.organizations
        render :index
    end

    def show
        @organization = current_user.organizations.find(params[:id])
        render :show
    end

    # only owners of an organization can create projects for it
    def create
        @organization = current_user.organizations.new(organization_params)

        if validate?
            validate(@organization)
        else
            if @organization.save
                render @organization
            else
                render json: @organization.errors, status: 422
            end
        end
    end

    def update
        @organization = current_user.organizations.find(params[:id])
        @organization.assign_attributes(organization_params)

        if validate?
            validate(@organization)
        else
            if @organization.save
                render @organization
            else
                render json: @organization.errors, status: 422
            end
        end
    end

    def destroy
        @organization = current_user.organizations.find(params[:id])

        if @organization.destroy
            render json: params[:id]
        else
            render json: ["Something went wrong!"], status: 404
        end
    end
private 
    def organization_params
        params.require(:organization).permit(:name)
    end

    def prevent_organization_modification!
        if ["Personal Projects", "Contributed Projects"].include?(current_user.organizations.find(params[:id]).name)
            render json: {organization: ["Organization can't be modified"]}, status: 422
        end
    end
end
