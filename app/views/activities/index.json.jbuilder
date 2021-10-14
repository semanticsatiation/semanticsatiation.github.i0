json.byId do
    @filtered_activities.each do |activity|
        json.set! activity.id do
            json.extract! activity, :activity, :id, :created_at
        end
    end
end

if @all_bug_activities_count
    json.totalActivities @all_bug_activities_count
else
    json.totalActivities @all_month_activities_count
end

json.allIds @filtered_activities.map(&:id)