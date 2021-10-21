json.extract! comment, :id, :comment, :reply_comment_id
json.parent_id comment.parent_id
json.created_at extract_date_or_time(comment.created_at, {date: true})
json.updated_at extract_date_or_time(comment.updated_at, {date: true})
json.submitter comment.submitter, :username, :id
json.wasUpdated comment.created_at != comment.updated_at
json.photoURL comment.submitter.photo.attached? ? (url_for(comment.submitter.photo)) : ("https://bug-off-public.s3.us-east-2.amazonaws.com/default_profile_picture.svg")

if !@is_replies
    json.totalRepliesCount comment.replies.count
    json.allIds []
end

if !@is_replies && comment.replies.any?
    json.replyPage 0
end