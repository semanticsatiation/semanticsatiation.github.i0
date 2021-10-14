# == Schema Information
#
# Table name: projects
#
#  id              :bigint           not null, primary key
#  description     :string           not null
#  name            :string           not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  organization_id :bigint
#  user_id         :bigint
#
# Indexes
#
#  index_projects_on_created_at       (created_at)
#  index_projects_on_name             (name)
#  index_projects_on_organization_id  (organization_id)
#  index_projects_on_user_id          (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
class Project < ApplicationRecord
  include Activitable
  
  belongs_to :owner,
    class_name: "User",
    foreign_key: :user_id

  belongs_to :organization

  has_many :bugs, dependent: :destroy

  has_many :project_contributers, dependent: :destroy

  has_many :workers,
    through: :project_contributers,
    source: :contributer


  validates :name, :description, presence: true
  validates :name, length: { :maximum => 30 }
  validates :description, length: { :maximum => 120 }

  def actual_workers
    self.workers.where(:project_contributers => { pending: false, contributed: [true, false] })
  end

  def all_workers_with_pending
    self.workers.select("users.*, project_contributers.pending AS pending, project_contributers.id AS project_contributer_id")
  end

  def exclude_workers(current_ids)
    self.actual_workers.where.not(id: current_ids)
  end
end
