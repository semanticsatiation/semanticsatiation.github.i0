class BugsController < ApplicationController
    before_action do
        must_be_a_project_worker!(params[:project_id])
    end

    before_action :must_be_project_or_bug_owner!, only: [:update, :destroy]
    before_action :set_project

    def index
        @bugs = @project.bugs
        
        if filter_by_people.any?
            @bugs = @project.bugs.joins(:bug_contributers).where(:bug_contributers => {user_id: filter_by_people}).distinct
        elsif filter_column == "ids"
            if !filter_string.blank?
                @bugs = @project.bugs.where(id: filter_string.split(/[,\s]+/))
            end
        else
            if ["status", "title"].include?(filter_column)
                @bugs = @project.bugs.where("bugs.#{filter_column} ilike ?", "%#{filter_string}%")
            else
                @bugs = @project.bugs.where("bugs.title ilike ?", "%#{filter_string}%")
            end
        end

        sort_by_column = determine_sort_by

        sort_by_value = {
            "1" => "ASC",
            "2" => "DESC"
        }[params[:sort][:sort_value]] || "ASC"

        @bugs = ["priority", "severity"].include?(sort_by_column) ? (
            column_hash = Bug::PRIORITY_SEVERITY_VALUES[sort_by_column.to_sym]
            column_keys = column_hash.keys
            @bugs.order(
                Arel.sql(<<-SQL.squish
                    CASE
                    WHEN #{sort_by_column} = '#{column_keys[0]}' THEN #{column_hash[column_keys[0]]}
                    WHEN #{sort_by_column} = '#{column_keys[1]}' THEN #{column_hash[column_keys[1]]}
                    WHEN #{sort_by_column} = '#{column_keys[2]}' THEN #{column_hash[column_keys[2]]}
                    END #{sort_by_value}
                SQL
                )
                # when interpolating #{column_keys[0]}, i need to put single quotes around it
                # or else ill get the following error:
                # ActionView::Template::Error - PG::UndefinedColumn: ERROR:  column "low" does not exist
                # LINE 1: ...d::text ilike '%%') ORDER BY CASE WHEN priority = low THEN 1...
            )
        ) : (
            @bugs.order(Arel.sql("#{["created_at", "close_date"].include?(sort_by_column) ? ("") : ("LOWER")}(#{sort_by_column}) #{sort_by_value}, #{sort_by_column} #{sort_by_value}, id #{sort_by_value}"))
        )
       

        @all_bugs_count = @bugs.size

        @bugs = @bugs.limit(32).offset(32 * off_set)

        render :index
    end

    def show
        @bug = @project.bugs.with_attached_photos.find(params[:id])
        @activity_total_count = @bug.activities.count
        @activities = @bug.activities.order(created_at: :desc).limit(10)

        # SERIOUS
        # MAKE SURE THE QUERIES ARE NOT TAXING (ESPECIALLY REPLIES)
        # only grab top level comments 
        comments = @bug.comments.where(parent_id: nil, reply_comment_id: nil).includes(submitter: :photo_attachment).includes(:replies)
        @all_comments_count = comments.count
        @comments = comments.order(created_at: :asc).limit(10)

        render :show
    end

    def create
        @bug = @project.bugs.new

        @bug.submitter = current_user

        @bug.assign_attributes(bug_params.except(:dead_line, :photos, :buggers))

        if dead_line_param.present?
            @bug.dead_line = Time.at(dead_line_param.to_i / 1000.0)
        end

        @bug.valid?

        validate_photos(@bug, photos)

        if validate?
            if @bug.errors.none?
                render json: {}
            else
                render json: @bug.errors, status: 422
            end
        else
            if @bug.errors.none? && @bug.save
                photos.each do |photo|
                    @bug.photos.attach(photo)
                end

                @project.activities.create(activity: "#{extract_date_or_time(@bug.created_at, {date: true, time: true})} - #{current_user.username} added a new bug titled '#{@bug.title}' (bug id: #{@bug.id})")
                @bug.activities.create(activity: "#{extract_date_or_time(@bug.created_at, {date: true, time: true})} - #{current_user.username} submitted this bug")

                if @project.owner != @bug.submitter
                    @project.owner.notifications.create(
                        context: "#{current_user.username} added a new bug to #{@project.name} (organization: #{@project.organization.name})",
                        actor_id: current_user.id,
                        recipient_id: @project.owner.id,
                        link: create_link(@project.id, {path: "bugs", id: @bug.id})
                    )
                end

                render :create
            else
                render json: @bug.errors, status: 422
            end
        end
    end

    def update
        @bug = @project.bugs.find(params[:id])
        @new_bug_instance = @project.bugs.find(params[:id])

        @bug.assign_attributes(bug_params.except(:dead_line, :photos, :buggers))


        if dead_line_param.present?
            @bug.dead_line = Time.at(dead_line_param.to_i / 1000.0)
        end

        @bug.valid?

        validate_photos(@bug, photos)
        validate_buggers(@new_bug_instance, bugger_ids)

        all_errors = @bug.errors.messages.merge(@new_bug_instance.errors.messages)
        
        if validate?
            if all_errors.none?
                render json: {}
            else
                render json: all_errors, status: 422
            end
        else
            if all_errors.none? && @bug.save
                # this has to be here since @bug.bugger_ids = bugger_ids
                # modifies .saved_changes value before I'm able to use it
                changes = @bug.saved_changes
                
                updated_time = extract_date_or_time(Time.now, {date: true, time: true})

                if @bug.photos.attached?
                    current_ids = @bug.photos.map(&:id).map(&:to_s)

                    to_be_purged = current_ids - photos.select{|photo| is_uploaded_file?(photo) == false && current_ids.include?(photo["id"])}.map{|photo| photo["id"]}
                    # i can't use .map(&:id) here because it gives me this error
                    # undefined method `id' for #<ActiveSupport::HashWithIndifferentAccess:0x00007fe141e227f8>
                    # i think because the only way to access the hash is only through ["id"] or [:id]
                    # but .map(&:id) accesses the hash with .id which doesn't work

                    @bug.photos.each do |photo|
                        if to_be_purged.include?(photo.id.to_s)
                            photo.purge
                        end
                    end
                end

                photos.each do |photo|
                    if is_uploaded_file?(photo)
                        @bug.photos.attach(photo)
                    end
                end

                old_workers = @bug.buggers.sort

                @bug.bugger_ids = bugger_ids

                new_workers = @bug.buggers.sort

                if old_workers != new_workers
                    old_workers.each do |old_worker|
                        if !new_workers.include?(old_worker)
                            @bug.activities.create(activity: "#{updated_time} - #{old_worker.username} has left the bug")

                            if old_worker != current_user
                                old_worker.notifications.create(
                                    context: "#{updated_time} - you have been removed from the bug '#{@bug.title}' (#{@project.owner === old_worker ? ("organization: #{@project.organization.name}, ") : (nil)}project name: #{@project.name}, bug id: #{@bug.id})",
                                    actor_id: current_user.id,
                                    recipient_id: old_worker.id,
                                )
                            end
                        end
                    end

                    new_workers.each do |new_worker|
                        if !old_workers.include?(new_worker)
                            @bug.activities.create(activity: "#{updated_time} - #{new_worker.username} is now working on this bug")

                            if new_worker != current_user
                                new_worker.notifications.create(
                                    context: "#{updated_time} - you have been added to the bug '#{@bug.title}' (#{@project.owner === new_worker ? ("organization: #{@project.organization.name}, ") : (nil)}project name: #{@project.name}, bug id: #{@bug.id})",
                                    actor_id: current_user.id,
                                    recipient_id: new_worker.id,
                                    link: create_link(@project.id, {path: "bugs", id: @bug.id})
                                ) 
                            end
                        end
                    end
                end

                static_changes = changes.slice(
                    :status,
                    :severity,
                    :dead_line,
                    :priority,
                    :close_date
                )

                dynamic_changes = changes.slice(
                    :title,
                    :description,
                    :expected_result,
                    :actual_result,
                    :environment,
                    :testing_version,
                    :steps,
                    :platform,
                    :url,
                    :components,
                )

                username = "by #{current_user.username}"

                if static_changes.any?
                    static_changes.keys.each do |key|
                        if key == "dead_line"
                            @bug.activities.create(activity: "#{updated_time} - dead line was changed from #{extract_date_or_time(static_changes[key][0], {date: true, time: true})} to #{extract_date_or_time(static_changes[key][1], {date: true, time: true})} #{username}")
                        elsif key == "close_date"
                            if static_changes["status"][1] == "closed"
                                @bug.activities.create(activity: "#{updated_time} - this bug has been closed #{username}")
                            end
                        else
                            @bug.activities.create(activity: "#{updated_time} - #{key} was changed from '#{static_changes[key][0]}' to '#{static_changes[key][1]}' #{username}")
                        end
                    end
                end

                if dynamic_changes.any?
                    dynamic_changes.keys.each do |key|
                        @bug.activities.create(activity: "#{updated_time} - #{key.split("_").join(" ")} was changed #{username}")
                    end
                end

                # (- [current_user]) is suggesting that the current_user will always be either
                # the owner of the bug or project manager so it will always take out a managaer or owner so they dont
                # receive notifications for changes they made themselves
                # (@bug.buggers + [@bug.submitter]) makes sure that the project owner NEVER receives 
                # notifications for bugs they aren't working on which is why the bug submitter, on the other hand,
                # WILL receive notifications because they are always subscribed to the bug they created
                if static_changes.any? || dynamic_changes.any?
                    (((@bug.buggers + [@bug.submitter]).uniq & @project.actual_workers) - [current_user]).each do |bugger|
                        bugger.notifications.create(
                            context: "#{updated_time} - #{current_user.username} updated the following (#{(static_changes.keys + dynamic_changes.keys).map{|prop| prop.split("_").join(" ")}.join(", ")}) for the bug '#{@bug.title}' (#{@project.owner === bugger ? ("organization: #{@project.organization.name}, ") : (nil)}project name: #{@project.name}, bug id: #{@bug.id})",
                            actor_id: current_user.id,
                            recipient_id: bugger.id,
                            link: create_link(@project.id, {path: "bugs", id: @bug.id})
                        )
                    end
                end

                render :create
            else
                render json: all_errors, status: 422
            end
        end
    end

    def destroy
        bug = @project.bugs.find(params[:id])
        # .load helps us execute the query right away instead of using it later where 
        # other things couldve happened to the object we're querying from thus leading to unex[ected changes]
        before_destroy_workers = bug.buggers.load

        if bug.destroy
            # THIS IS FOR NOTIFICATIONS ONLY FOR OTHERS USER WHO DID NOT UPDATE THE BUG THEMSELVES
            ((before_destroy_workers + [bug.submitter, @project.owner]).uniq - [current_user]).each do |bugger|
                bugger.notifications.create(
                    context: "#{extract_date_or_time(Time.current, {date: true, time: true})} - #{current_user.username} deleted the bug '#{bug.title}' (#{@project.owner === bugger ? ("organization: #{@project.organization.name}, ") : (nil)}project name: #{@project.name}, bug id: #{bug.id})",
                    actor_id: current_user.id,
                    recipient_id: bugger.id,
                    link: create_link(@project.id, {path: "bugs", id: bug.id})
                )
            end

            @project.activities.create(activity: "#{extract_date_or_time(Time.now, {date: true, time: true})} - the bug '#{bug.title}' was removed from this project (bug id: #{bug.id})")

            render json: {}
        else
            render json: bug.errors, status: 422
        end
    end
private 
    def bug_params
        params.require(:bug).permit(:title, :description, :priority, :status, :severity, :expected_result, :actual_result, :environment, :testing_version, :steps, :platform, :url, :components, :dead_line, :buggers, photos: {})
    end

    def must_be_project_or_bug_owner!
        bug = Bug.find(params[:id])

        is_not_owner_or_parent?(bug.project.owner, bug.submitter)
    end

    def validate_photos(bug, photos)
        if photos.length > 3
            bug.errors.add(:photos, "are limited to 3")
        end

        photos.each do |photo|
            if is_uploaded_file?(photo)
                [photo.content_type.in?(User::VALID_PHOTO_FORMATS), photo.size <= 1000000].each_with_index do |test, ind| 
                    unless test
                        bug.errors.add(:photos, "#{photo.original_filename} #{User::PHOTO_VALIDATIONS[ind]}")
                    end
                end
            end
        end
    end

    def validate_buggers(bug, buggers)
        # SERIOUS
        # How do i validate each bugger without creating so many queries?
        to_be_validated = buggers.map(&:to_i) - bug.buggers.pluck(:id)

        to_be_validated.each do |user_id|
            # bug_contributer = bug.bug_contributers.new(user_id: 22222)
           bug_contributer =  bug.bug_contributers.new(user_id: user_id)

            if !bug_contributer.valid?
                bug_contributer.errors.full_messages.each do |error|
                    bug.errors.add(:buggers, error)
                end
            end
        end
    end

    def filter_by_people
        params[:filter][:by_people].split(" ").map(&:to_i)
    end

    def dead_line_param
        params[:bug][:dead_line]
    end

    def photos
        all_photos = params[:bug][:photos]
        all_photos ? (all_photos.values) : ([])
    end

    def bugger_ids
        params[:bug][:buggers].split(",")
    end

    def determine_sort_by
        if ["opened", "title", "closed", "priority", "severity"].include?(sort_by)
            if sort_by == "opened"
                "created_at"
            elsif sort_by == "closed"
                "close_date"
            else
                sort_by
            end
        else
            "created_at"
        end
    end
end