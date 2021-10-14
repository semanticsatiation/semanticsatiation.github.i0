json.extract! @bug, :id, :title, :status, :priority, :severity

json.created_at extract_date_or_time(@bug.created_at, {date: true})
json.close_date @bug.determine_close_date_value
json.isOverdue @bug.is_overdue?