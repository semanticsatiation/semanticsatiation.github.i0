class ApplicationController < ActionController::Base
    before_action :must_be_signed_in!

    # this catches all RecordNotFound errors and rescues it with
    # with the method down below called record_not_found
    rescue_from ActiveRecord::RecordNotFound, :with => :record_not_found

    def extract_date_or_time(date_time_string, options = {})
        string = ""

        eastern_time = date_time_string.in_time_zone('Eastern Time (US & Canada)')

        if options[:date] && options[:time]
            string += eastern_time.strftime("%m-%d-%Y") + " " + eastern_time.strftime("%I:%M %p")
        elsif options[:time]
            string += eastern_time.strftime("%I:%M %p")
        else
            string += eastern_time.strftime("%m-%d-%Y")
        end
        
        string unless string.blank?
    end

    def is_uploaded_file?(photo)
        photo.class == ActionDispatch::Http::UploadedFile
    end

    helper_method :current_user, :logged_in?, :extract_date_or_time

private
    def current_user
        return nil if session[:session_token].nil?
        @current_user ||= User.find_by(session_token: session[:session_token])
    end

    def log_in!(user)
        session[:session_token] = user.reset_session_token!
    end

    def log_out!
        current_user.reset_session_token!
        session[:session_token] = nil
    end

    def logged_in?
        !current_user.nil?
    end

    def must_be_signed_in!
        unless current_user
            render json: {app: ["You must be signed in!"]}, status: 422
        end
    end

    def record_not_found
        render json: {app: ["Record could not be found!"]}, status: 404
    end

    def must_be_organization_owner!(organization_id = nil)
        is_not_owner_or_parent?(Organization.find(organization_id || params[:id]).manager)
    end

    def must_be_project_owner!(project_id = nil)
        is_not_owner_or_parent?(Project.find(project_id || params[:id]).owner)
    end

    def must_be_project_or_bug_contributer_owner!
        bug_contributer = BugContributer.find(params[:id])

        is_not_owner_or_parent?(bug_contributer.project.owner,  bug_contributer.contributer)
    end

    def is_not_owner_or_parent?(*users)
        if users.all?{|user| user != current_user}
            render json: {app: ["You don't have permission to do this!"]}, status: 403
        end
    end

    def set_project
        @project = Project.find(params[:project_id])
    end

    def must_be_a_project_worker!(project_id = nil)
        if !Project.find(project_id || params[:id]).actual_workers.include?(current_user)
            render json: {app: ["You are not a part of this project!"]}, status: 422
        end
    end

    def sort_by
        params[:sort][:sort_by]
    end

    def filter_string
        params[:filter][:string]
    end

    def filter_column
        params[:filter][:filter_by]
    end

    def off_set
        params[:off_set].to_i
    end

    def recalibrate?
        params.has_key?(:recalibrate)
    end

    def validate?
        params.has_key?(:validate)
    end

    def validate(object)
        # this method is for object just trying to validate themselves and nothing else
        if object.valid?
            render json: {}
        else
            render json: object.errors, status: 422
        end
    end

    def create_link(project_id, route = {})
        link = "/projects/#{project_id}"

        # SERIOUS
        # ADD ORGANIZATION TO THE LINK SO WE CAN SWITCH ORGANIZTIONS
        # IN THE FRONT END AND THEN HEAD STARIGHT TO THE PROJECT
        # organization: #{} -

        if route.any?
            link += "/#{route[:path]}/#{route[:id]}"
        end

        link
    end
end
