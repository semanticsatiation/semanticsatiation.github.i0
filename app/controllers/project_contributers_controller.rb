class ProjectContributersController < ApplicationController
    # no person who isn't part of the project should be able to access
    # the following actions in any way
    before_action except: [:update, :destroy] do
        must_be_a_project_worker!(params[:project_id])
    end

    # only project owners can add people to projects
    before_action only: [:create] do
        must_be_project_owner!(params[:project_id])
    end

    before_action :set_project

    # only the project owner can remove workers from projects but also, 
    # workers have the option to leave a project
    before_action :must_be_project_or_project_contributer_owner!, only: [:update, :destroy]
    before_action :prevent_project_owner_deletion!, only: [:destroy]

    def index
        @filter_for_buggers = params.has_key?(:filter_for_buggers)

        if @filter_for_buggers
            @people = @project.exclude_workers(params[:filter_for_buggers].split(" ").map(&:to_i)).with_attached_photo.where("username ilike ?", "%#{filter_string}%").order(Arel.sql("LOWER(username)"))
        else
            @people = @project.all_workers_with_pending.with_attached_photo.where("#{determine_filter_column} ilike ?", "%#{filter_string}%")

            if sort_by == "name"
                @people = @people.order(Arel.sql("LOWER(#{determine_filter_column}), #{determine_filter_column}, id"))
            elsif sort_by == "name alt"
                @people = @people.order(Arel.sql("LOWER(#{determine_filter_column}) DESC, #{determine_filter_column} DESC, id DESC"))
            else
                # order by pending invites first, then by date invited to project
                @people = @people.order("project_contributers.pending DESC, project_contributers.created_at DESC")
            end

            @recalibrate = recalibrate?

            if @recalibrate
                @all_current_people_ids = @people.limit(18 * off_set).map(&:id)
            end

            @all_people_count = @people.size

            @people = @people.limit(18).offset(18 * off_set)
        end

        render :index
    end

    def create
        @contribution = @project.project_contributers.new

        @contribution.user_id = params[:user_id]
        # user that will contribute

        @contribution.contributed = true

        if @contribution.save
            @contributer = @contribution.contributer

            @contributer.notifications.create(
                context: "#{extract_date_or_time(Time.current, {date: true, time: true})} - you have been invited to the project `#{@contribution.project.name}` by #{@contribution.project.owner.username}",
                actor_id: current_user.id,
                recipient_id: @contributer.id,
                link: create_link(@project.id, {path: "people", id: nil}),
                action: "addPerson",
                project_contributer_id: @contribution.id
            )
            
            render :create
        else
            render json: @contribution.errors, status: 422
        end
    end

    def update
        project_contribution = @project.project_contributers.find(params[:id])

        if project_contribution.update(project_contributer_params)
            changes = project_contribution.saved_changes.slice(:pending)

            just_added_to_project = changes.any? && changes[:pending][0] == true && changes[:pending][1] == false

            if just_added_to_project
                Notification.find(params[:notification_id]).destroy
            end
            
            @project.activities.create(activity: "#{extract_date_or_time(Time.now, {date: true, time: true})} - the user '#{project_contribution.contributer.username}' has joined the project")

            @project.owner.notifications.create(
                context: "#{extract_date_or_time(Time.now, {date: true, time: true})} - #{project_contribution.contributer.username} has accepted the invite to the project '#{@project.name}'",
                actor_id: current_user.id,
                recipient_id: @project.owner.id
            )

            render json: just_added_to_project ? ({id: params[:notification_id], context: "You've accepted the invitation to the project '#{@project.name}"}) : ({})
        else
            render json: {app: "Something went wrong!"}, status: 404
        end
    end

    def destroy
        project_contribution = @project.project_contributers.find(params[:id])
        contributer = project_contribution.contributer
        is_project_owner = current_user == @project.owner

        begin
            ActiveRecord::Base.transaction do
                notif = Notification.find_by(project_contributer_id: params[:id], recipient_id: contributer.id)
                if !notif.nil?
                    notif.destroy
                end
                
                project_contribution.destroy
            end

            if project_contribution.pending == false && project_contribution.contributed
                # activity should be made only if the user was part of the project
                # we dont want to create an activity for the following situations: 
                # people who deny a project invitiation
                # people who were removed from a project but did not yet accept the invite

                @project.activities.create(activity: "#{extract_date_or_time(Time.now, {date: true, time: true})} - the user '#{contributer.username}' #{is_project_owner ? ("was removed from") : ("left")} the project")

                if current_user == @project.owner
                    contributer.notifications.create(
                        context: "#{extract_date_or_time(Time.now, {date: true, time: true})} - #{current_user.username} has removed you from the project '#{@project.name}'",
                        actor_id: current_user.id,
                        recipient_id: contributer.id
                    )
                elsif current_user == contributer
                    @project.owner.notifications.create(
                        context: "#{extract_date_or_time(Time.now, {date: true, time: true})} - #{contributer.username} has left the project '#{@project.name}'",
                        actor_id: current_user.id,
                        recipient_id: @project.owner.id
                    )
                end 
            elsif project_contribution.pending && project_contribution.contributed
                if !is_project_owner
                    @project.owner.notifications.create(
                        context: "#{extract_date_or_time(Time.now, {date: true, time: true})} - #{contributer.username} has denied the '#{@project.name}' invititation",
                        actor_id: current_user.id,
                        recipient_id: @project.owner.id
                    )
                end
            end

            if params[:notification_id]
                render json: {id: params[:notification_id], context: "You've declined the invitation to the project '#{@project.name}"}
            else
                # so if the current_user is the project owner, we should return the worker's id so we can remove the person
                # from the front end

                # otherwise, this means that the user is leaving the project which we should return the project id because
                # this isd how we will remove the project from their contributed list
                render json: is_project_owner ? (contributer.id) : (@project.id)
            end
        rescue
            render json: {app: "Something went wrong!"}, status: 404
        end
    end

private
    def project_contributer_params
        params.require(:project_contributer).permit(:pending)
    end

    def must_be_project_or_project_contributer_owner!
        project_contributer = ProjectContributer.find(params[:id])

        is_not_owner_or_parent?(project_contributer.project.owner, project_contributer.contributer)
    end

    def prevent_project_owner_deletion!
        project = Project.find(params[:project_id])

        if project.owner == project.project_contributers.find(params[:id]).contributer
            render json: {app: ["Owner can't be deleted!"]}, status: 422
        end
    end

    def determine_filter_column
        if ["username", "email"].include?(filter_column)
            filter_column
        else
            "username"
        end
    end
end