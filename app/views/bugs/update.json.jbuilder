
json.merge! @bug.as_json.except("user_id", "project_id", "updated_at", "close_date", "created_at", "dead_line")

json.submitter @bug.submitter, :id, :username

json.created_at extract_date_or_time(@bug.created_at, {date: true})
json.updated_at extract_date_or_time(@bug.updated_at, {date: true, time: true})
json.dead_line extract_date_or_time(@bug.dead_line, {date: true, time: true})
json.isOverdue @bug.is_overdue?

if @bug.close_date
    json.close_date extract_date_or_time(@bug.close_date, {date: true, time: true}) 
end