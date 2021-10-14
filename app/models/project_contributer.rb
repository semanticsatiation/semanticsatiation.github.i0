# == Schema Information
#
# Table name: project_contributers
#
#  id          :bigint           not null, primary key
#  contributed :boolean          default(FALSE)
#  pending     :boolean          default(TRUE)
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  project_id  :bigint
#  user_id     :bigint
#
# Indexes
#
#  index_project_contributers_on_created_at              (created_at)
#  index_project_contributers_on_pending                 (pending)
#  index_project_contributers_on_project_id              (project_id)
#  index_project_contributers_on_project_id_and_user_id  (project_id,user_id) UNIQUE
#  index_project_contributers_on_user_id                 (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (project_id => projects.id)
#  fk_rails_...  (user_id => users.id)
#
class ProjectContributer < ApplicationRecord
    belongs_to :contributer,
        class_name: "User",
        foreign_key: :user_id

    belongs_to :project

    # if we destroy a project_contributer record, make sure all 
    # bug_contributions, the project_contributer made,
    # are all destroyed
    has_many :bug_contributions,
        class_name: "BugContributer",
        primary_key: :user_id,
        foreign_key: :user_id,
        dependent: :destroy


    validates_uniqueness_of :project_id, scope: :user_id, :message => "Worker has already been added to this project!"
    # make sure a project doesn't have duplicate contributions from one worker
end
