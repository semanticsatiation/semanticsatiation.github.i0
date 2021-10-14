class SessionsController < ApplicationController 
    skip_before_action :must_be_signed_in!, except: [:destroy]

    def create
        @user = User.find_by_credentials(params[:session][:username], params[:session][:password])

        if @user
            log_in!(@user)
            render :session
        else
            render json: {session_form: ["Credentials Invalid"]}, status: 422
        end
    end

    def destroy
        if logged_in?
            log_out!
            render json: {} 
        else
            render json: {}, status: 404
        end
    end
end