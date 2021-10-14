class ProjectsController < ApplicationController
    # only the owner of an organization can create projects for their organization
    before_action only: [:index, :create] do
        must_be_organization_owner!(params[:organization_id])
    end

    before_action :must_be_a_project_worker!, only: [:show]
    before_action :must_be_project_owner!, only: [:update, :destroy]
    before_action :prevent_contributed_project_creation!, only: [:create]
    before_action :set_organization
    before_action :set_is_project_contributed, only: [:index, :show]

    def index
        if @is_project_contributed
            @projects = current_user.public_project_contributions
        else
            @projects = @organization.projects
        end

        @projects = @projects.where("name ilike ?", "%#{filter_string}%")

        if sort_by == "name"
            # LOWER makes our ordering case-insensitive

            # .order('LOWER(name)') is deprecated and we get the following if we use it:
            # DEPRECATION WARNING: Dangerous query method (method whose arguments are used as raw SQL) 
            # called with non-attribute argument(s): "LOWER(name) DESC".
            @projects = @projects.order(Arel.sql("LOWER(name), name, id"))
        elsif sort_by == "name alt"
            @projects = @projects.order(Arel.sql("LOWER(name) DESC, name DESC, id DESC"))
            # if there are two projects names that are the same, we will than sort them by their normal names
            # but without using LOWER(name); this is the second option we pass in which is ", name DESC"
            # if we STILL have names that are the same, we then sort by their ids which is always unique (", id DESC")
            # and that should be the end of our problem
        else
            if @is_project_contributed
                @projects = @projects.order("project_contributers.created_at DESC")
            else
                @projects = @projects.order(created_at: :desc)
            end
        end

        @to_be_sorted = to_be_sorted
        @recalibrate = recalibrate?

        @upcoming_projects = @to_be_sorted.any? && !off_set.nil? 

        if @upcoming_projects || @recalibrate
            @all_current_project_ids = @projects.limit(8 * off_set).map(&:id)
        end

        @all_projects_count = @projects.size

        @projects = @projects.limit(8).offset(8 * off_set)
        # i wasnt able to use limit.offset because of how the sort was affected when there were two
        # projects with similar names "TRASH" and "TRAsh", "TRASH" and "TRASH", etc...
        # problem explained in the following link: https://www.reddit.com/r/rails/comments/kyg9ch/record_keeps_disappearing_after_querying/
        
        render :index
    end

    def show
        if @is_project_contributed
            @project = current_user.public_project_contributions
        else
            @project = @organization.projects
        end

        @project = @project.find(params[:id])

        render :show
    end

    def create
        @project = @organization.projects.new(project_params)
        @project.user_id = current_user.id

        if validate?
            validate(@project)
        else
            if @project.save
                @project.activities.create(activity: "#{extract_date_or_time(@project.created_at, {date: true, time: true})} - #{@project.name} was created")
                # make sure the owner is considered a worker of the project
                @project.project_contributers.create(user_id: @project.owner.id, project_id: @project.id, pending: false)

                render @project
            else
                render json: @project.errors, status: 422
            end  
        end
    end

    def update
        @project = @organization.projects.find(params[:id])
        old_project = @project.dup
        @project.assign_attributes(project_params)
        
        if validate?
            validate(@project)
        else
            if @project.save
                notification_context = [] 
                changes = @project.saved_changes.slice(:name, :description)

                if changes.any?
                    changes.keys.each do |key|
                        update_context = "the #{key} was changed from '#{changes[key][0]}' to '#{changes[key][1]}'"
                        notification_context.push(update_context)
                        @project.activities.create(activity: "#{extract_date_or_time(@project.updated_at, {date: true, time: true})} - #{update_context}")
                    end

                    (@project.actual_workers - [current_user]).each do |worker|
                        worker.notifications.create(
                            context: "#{extract_date_or_time(@project.updated_at, {date: true, time: true})} - #{"changes have been made to the following project '#{old_project.name}': " + notification_context.join(", ")}",
                            actor_id: current_user.id,
                            recipient_id: worker.id,
                            link: create_link(@project.id)
                        )
                    end
                end

                render :show
            else
                render json: @project.errors, status: 422
            end
        end
    end

    def destroy
        @project = @organization.projects.find(params[:id])

        old_workers = @project.actual_workers.load

        if @project
            if @project.destroy
                (old_workers - [current_user]).each do |worker|
                    worker.notifications.create!(
                        context: "#{extract_date_or_time(Time.current, {date: true, time: true})} - the project you were contributing to, titled #{@project.name}, has been deleted",
                        actor_id: current_user.id,
                        recipient_id: worker.id
                    )
                end

                render json: @project.id
            else
                render json: ["Something went wrong!"], status: 404
            end
        end
    end

private
    def project_params
        params.require(:project).permit(:name, :description)
    end

    def set_is_project_contributed
        @is_project_contributed = @organization.name == "Contributed Projects"
    end

    def set_organization
        @organization = current_user.organizations.find(params[:organization_id])
    end

    def prevent_contributed_project_creation!
        if current_user.organizations.find(params[:organization_id]).name == "Contributed Projects"
            render json: {organization: ["Projects can't be created for this organization"]}, status: 422
        end
    end

    def to_be_sorted
        sort_ids = params[:sort][:to_be_sorted]
        
        (sort_ids ? (sort_ids.split(",")) : ([])).map(&:to_i)
    end
end