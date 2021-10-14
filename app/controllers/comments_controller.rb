class CommentsController < ApplicationController
    before_action do
        must_be_a_project_worker!(params[:project_id])
    end

    # only the owner should be able to edit their comment
    before_action :must_only_be_comment_owner!, only: [:update]

    # but either the comment owner or project owner can delete the comment
    before_action :must_be_project_or_bug_or_comment_owner!, only: [:destroy]

    before_action :set_project

    def index
        @comments = @project.bugs.find(params[:bug_id]).comments

        @is_replies = params.has_key?(:replies)

        if @is_replies
            @comments = @comments.find(params[:replies]).replies
        else
            @comments = @comments.where(parent_id: nil, reply_comment_id: nil)
        end

        @comments = @comments.order(created_at: :asc)

        @recalibrate = recalibrate?

        if @recalibrate
            @all_current_comments_ids = @comments.limit(10 * off_set).map(&:id)
        end

        @all_comments_count = @comments.size

        @comments = @comments.limit(10).offset(10 * off_set)
 
        render :index
    end

    def create
        @comment = @project.bugs.find(params[:bug_id]).comments.new(comment_params)
        @comment.submitter = current_user

        if validate?
            validate(@comment)
        else
            if @comment.save
                bug = @comment.bug
                # @project.actual_workers.include?(bug.submitter || @comment.reply.submitter) is so the bug submitter 
                # only receives the notification if they are still part of the project
                if @project.actual_workers.include?(bug.submitter) && ((@comment.parent_id == nil || @comment.reply_comment_id == nil) && current_user != bug.submitter)
                    bug.submitter.notifications.create(
                        context: "#{extract_date_or_time(Time.current, {date: true, time: true})} - #{current_user.username} left a comment on your bug titled '#{bug.title}' (bug id: #{bug.id}) from the project '#{@project.name}'#{@project.owner === bug.submitter ? (" (organization: #{@project.organization.name})") : (nil)}",
                        actor_id: current_user.id,
                        recipient_id: bug.submitter.id,
                        link: create_link(@project.id, {path: "bugs", id: bug.id})
                    )
                elsif @comment.reply && @project.actual_workers.include?(@comment.reply.submitter) && @comment.reply.submitter != current_user
                    @comment.reply.submitter.notifications.create(
                        context: "#{extract_date_or_time(Time.current, {date: true, time: true})} - #{current_user.username} responded to your '#{@comment.reply.comment}' comment from the project '#{@project.name}' and bug titled '#{bug.title}' (bug id: #{bug.id})#{@project.owner === @comment.reply.submitter ? (" (organization: #{@project.organization.name})") : (nil)}",
                        actor_id: current_user.id,
                        recipient_id: @comment.reply.submitter.id,
                        link: create_link(@project.id, {path: "bugs", id: bug.id})
                    )
                end
                
                render :create
            else
                render json: @comment.errors, status: 422
            end  
        end
    end

    def update
        @comment = @project.bugs.find(params[:bug_id]).comments.find(params[:id])
        @comment.assign_attributes(comment_params)

        if validate?
            validate(@comment)
        else
            if @comment.update(comment_params)
                render :update
            else
                render json: @comment.errors, status: 422  
            end
        end
    end

    def destroy
        @comment = @project.bugs.find(params[:bug_id]).comments.find(params[:id])

        new_comments_count = nil

        is_child = @comment.reply_comment_id != nil

        allDeletedCommentsIds = @comment.comment_ancestors.map(&:id)

        if is_child ? (@comment.delete_comment_ancestors) : (@comment.destroy)
            if is_child
                new_comments_count = @comment.parent.replies.count
            end

            render json: {allDeletedCommentsIds: is_child ? (allDeletedCommentsIds) : (@comment.id), newCommentsCount: new_comments_count}
        else
            render json: {}, status: 422  
        end
    end

private 
    def comment_params
        params.require(:comment).permit(:parent_id, :comment, :reply_comment_id)
    end

    def must_be_project_or_bug_or_comment_owner!
        comment = Comment.find(params[:id])

        is_not_owner_or_parent?(comment.project.owner, comment.submitter, comment.bug.submitter)
    end

    def must_only_be_comment_owner!
        comment = Comment.find(params[:id])

        if comment.submitter != current_user
            render json: {comment: ["You are not the owner of this comment!"]}, status: 403
        end
    end
end
