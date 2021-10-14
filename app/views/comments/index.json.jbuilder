json.byId do
    @comments.each do |comment|
        json.set! comment.id do
            json.partial! "/comments/comment", comment: comment
        end
    end
end

if @recalibrate
    json.allIds(@all_current_comments_ids + @comments.map(&:id))
else
    json.allIds @comments.map(&:id)
end

if @is_replies
    json.totalRepliesCount @all_comments_count
else
    json.totalComments @all_comments_count
end