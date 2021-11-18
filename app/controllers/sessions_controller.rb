
class SessionsController < ApplicationController 
    skip_before_action :must_be_signed_in!, except: [:destroy]

    def create
        if params[:session][:guest]
            @user = User.create!(username: "bug_off_guest_#{User.last.id + 1}", password: Passgen::generate(:symbols => true, :length => 25), guest: true)
        else
            @user = User.find_by_credentials(params[:session][:username], params[:session][:password])
        end

        if @user
            log_in!(@user)
            render :session
        else
            render json: {session_form: ["Credentials Invalid"]}, status: 422
        end
    end

    def destroy
        id = current_user.id

        if logged_in?
            log_out!

            logged_out_user = User.find(id)

            if logged_out_user.guest
                logged_out_user.destroy
            end
            
            render json: {} 
        else
            render json: {}, status: 404
        end
    end
end