class NotificationsController < ApplicationController
    def index
        @notifications = current_user.notifications.order(created_at: :desc)

        render :index
    end

    def update
        @notification = Notification.find(params[:id])

        @notification.read = true

        if @notification.update
            render :update
        else
            render json: @notification.errors, status: 422
        end
    end
end