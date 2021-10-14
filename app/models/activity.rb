# == Schema Information
#
# Table name: activities
#
#  id               :bigint           not null, primary key
#  activitable_type :string
#  activity         :string           not null
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  activitable_id   :bigint
#
# Indexes
#
#  index_activities_on_activitable  (activitable_type,activitable_id)
#
class Activity < ApplicationRecord
  belongs_to :activitable, polymorphic: true

  validates :activity, presence: true

  def project
      if self.activitable_type == "Project"
          return Project.find(self.activitable_id)
      end

      raise NoMethodError.new("Undefined method 'project' for #{self}")
  end

  def bug
      if self.activitable_type == "Bug"
          return Bug.find(self.activitable_id)
      end
      raise NoMethodError.new("Undefined method 'bug' for #{self}")
  end
end
