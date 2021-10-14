# == Schema Information
#
# Table name: bug_contributers
#
#  id         :bigint           not null, primary key
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  bug_id     :bigint
#  user_id    :bigint
#
# Indexes
#
#  index_bug_contributers_on_bug_id              (bug_id)
#  index_bug_contributers_on_bug_id_and_user_id  (bug_id,user_id) UNIQUE
#  index_bug_contributers_on_user_id             (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (bug_id => bugs.id)
#  fk_rails_...  (user_id => users.id)
#
class BugContributer < ApplicationRecord
  belongs_to :contributer,
    class_name: "User",
    foreign_key: :user_id

  belongs_to :bug

  # delegate helps us refer to self's grandparent, which would be Project in this case
  delegate :project, :to => :bug, :allow_nil => true

  validates_uniqueness_of :bug_id, scope: :user_id
  # make sure a bug doesn't have duplicate buggers

  validate :worker_exists?

  after_save :update_bug
  after_destroy :update_bug

private
  def worker_exists?
    if self.contributer
      if !self.project.actual_workers.include?(self.contributer)
        self.errors.add("#{self.contributer.username}", "isn't contributing to this project")
      end
    end
  end

  # updating the workers for a bug counts as updating a bug
  def update_bug
    b = self.bug
    b.updated_at = Time.current
    b.save
  end
end
