
json.merge! @bug.as_json.except("id", "user_id", "project_id", "updated_at", "close_date", "created_at", "dead_line")

# @bug.as_json.except lets us target attributes that are not part of the model
# for instance project_id and user_id

json.submitter @bug.submitter, :id, :username


json.created_at extract_date_or_time(@bug.created_at, {date: true})
json.updated_at extract_date_or_time(@bug.updated_at, {date: true, time: true})
json.dead_line extract_date_or_time(@bug.dead_line, {date: true, time: true})

if @bug.close_date
    json.close_date extract_date_or_time(@bug.close_date, {date: true, time: true}) 
end

json.buggers do
    json.byId do
        @bug.buggers.with_attached_photo.each do |bugger|
            json.set! bugger.id do
                json.extract! bugger, :id, :username
                json.photoURL bugger.photo.attached? ? (url_for(bugger.photo)) : ("https://bug-off-dev.s3.us-east-2.amazonaws.com/default-profile-picture.png")
            end
        end
    end
    
    json.allIds @bug.buggers.map(&:id)
end

json.photos @bug.photos.map{ |bugPhoto| { id: bugPhoto.id, preview: url_for(bugPhoto)} }

json.activities do
    json.byId do
        @activities.each do |activity|
            json.set! activity.id do
                json.extract! activity, :activity
            end
        end
    end
    
    json.allIds @activities.map(&:id)
    json.totalActivities @activity_total_count
end

json.comments do
    json.byId do
        @comments.each do |comment|
            json.set! comment.id do
                json.partial! "/comments/comment", comment: comment
            end
        end
    end
    
    json.allIds @comments.map(&:id)
    json.totalComments @all_comments_count
end