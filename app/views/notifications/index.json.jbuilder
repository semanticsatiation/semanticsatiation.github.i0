json.byId do
    @notifications.each do |notification|
        json.set! notification.id do
            json.extract! notification, :id, :context, :action, :link
            if notification.project_contributer_id != nil
                json.project_contributer_id notification.project_contributer_id
            end
        end
    end
end

json.allIds @notifications.map(&:id)

json.totalNotifications @all_notifications.count