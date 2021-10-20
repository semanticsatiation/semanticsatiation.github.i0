class NotificationsController < ApplicationController
    def index
        @all_notifications = current_user.notifications
        @notifications = @all_notifications.limit(20).offset(20 * off_set).order(created_at: :desc)

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