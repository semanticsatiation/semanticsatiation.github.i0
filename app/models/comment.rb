# == Schema Information
#
# Table name: comments
#
#  id               :bigint           not null, primary key
#  comment          :text             not null
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  bug_id           :bigint
#  parent_id        :bigint
#  reply_comment_id :bigint
#  user_id          :bigint
#
# Indexes
#
#  index_comments_on_bug_id   (bug_id)
#  index_comments_on_user_id  (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (bug_id => bugs.id)
#  fk_rails_...  (user_id => users.id)
#
class Comment < ApplicationRecord
  belongs_to :bug

  belongs_to :submitter,
    class_name: "User",
    foreign_key: :user_id

  belongs_to :parent,
    class_name: "Comment",
    foreign_key: :parent_id,
    :optional => true

  belongs_to :reply,
    class_name: "Comment",
    foreign_key: :reply_comment_id,
    :optional => true

  # for parent replies
  has_many :replies, class_name: "Comment", foreign_key: :parent_id, dependent: :destroy

  has_many :child_replies, class_name: "Comment", foreign_key: :reply_comment_id

  validates :comment, 
          :presence => {:message => "comment can't be blank" },
          :length => { :maximum => 300, :message => "comment is too long"}
  
  validate :must_be_project_worker
  validate :must_be_bug_worker

  # delegate helps us refer to self's grandparent, which would be Project in this case
  delegate :project, :to => :bug, :allow_nil => true

  def delete_comment_ancestors
    # this deletes all ancestors of a comment including self 
    Comment.where(id: self.comment_ancestors.map(&:id)).destroy_all
  end

  def comment_ancestors
    # THIS IS VERY TAXING
    # We query the backend for EACH child which can become problematic but I still don't
    # know how to delete ancestors comments properly
    result = []
    children = self.child_replies.includes(:replies)
    return [self] if children.empty?

    children.each do |recursed_child|
        result << recursed_child.comment_ancestors
    end

    result.flatten << self
  end

private
  def must_be_project_worker
    if self.project && !self.project.actual_workers.include?(User.find(self.user_id))
      self.errors.add(:comment, "submitter must be a project worker")
    end
  end

  def must_be_bug_worker
    # !(self.bug.submitter == User.find(self.user_id)) is saying that the person who submitted the 
    # bug is still able to comment even if they aren't contributing to it same goes for the project owner
    if self.bug && !self.bug.buggers.include?(User.find(self.user_id)) && self.bug.submitter != User.find(self.user_id) && self.bug.project.owner != User.find(self.user_id)
      self.errors.add(:comment, "you are not associated with this bug in any way")
    end 
  end
end
