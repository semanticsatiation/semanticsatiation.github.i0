# == Schema Information
#
# Table name: bugs
#
#  id              :bigint           not null, primary key
#  actual_result   :string           not null
#  close_date      :datetime
#  components      :string           not null
#  dead_line       :datetime         not null
#  description     :text             not null
#  environment     :string           not null
#  expected_result :string           not null
#  platform        :string           not null
#  priority        :string           default("low"), not null
#  severity        :string           default("minor"), not null
#  status          :string           default("new"), not null
#  steps           :string           not null
#  testing_version :string           not null
#  title           :string           not null
#  url             :string           not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  project_id      :bigint
#  user_id         :bigint
#
# Indexes
#
#  index_bugs_on_priority    (priority)
#  index_bugs_on_project_id  (project_id)
#  index_bugs_on_severity    (severity)
#  index_bugs_on_status      (status)
#  index_bugs_on_title       (title)
#  index_bugs_on_user_id     (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (project_id => projects.id)
#  fk_rails_...  (user_id => users.id)
#
class Bug < ApplicationRecord
  include Activitable

  belongs_to :project
  
  belongs_to :submitter,
    class_name: "User",
    foreign_key: :user_id

  has_many :bug_contributers, dependent: :destroy
  # using this to connect the join table to this model
      
  has_many :buggers, 
    through: :bug_contributers,
    source: :contributer
  # this is how we find out who is working on a bug

  has_many :comments, dependent: :destroy

  has_many_attached :photos

  validates :title, :description, :priority, :status, :severity, :expected_result, :actual_result, :environment, :testing_version, :steps, :platform, :url, :components, :dead_line, presence: true

  validate :valid_severity
  validate :valid_status
  validate :valid_priority
  validate :dates_cannot_be_in_the_past
  # validate :limit_photos

  after_validation :set_close_date

  PRIORITY_SEVERITY_VALUES = {
     priority: {
      low: 1,
      medium: 2,
      high: 3,
    },
    severity: {
      minor: 1,
      major: 2,
      critical: 3,
    },
  }

  def determine_close_date_value
    if self.close_date.nil?
      "ongoing"
    else
      self.close_date.in_time_zone('Eastern Time (US & Canada)').strftime("%m-%d-%Y")
    end
  end

  def addable_buggers
    # this is for bug_workers_search.jsx where we only want people who are part of the project 
    # but are not currently contributing to self

    # contributed: [true, false] is to include project owners since they arent contributing to projects they own
    self.project.actual_workers.where.not(id: self.bug_contributers.pluck(:user_id))
  end

  def is_overdue?
    ["fixed", "closed", "rejected", "duplicate", "not a bug"].none?(self.status) && self.dead_line.in_time_zone('Eastern Time (US & Canada)').to_i <= Time.current.in_time_zone('Eastern Time (US & Canada)').to_i 
  end

private
# i can merge the methods between 
  def valid_severity
    if !["minor", "major", "critical"].include?(self.severity)
      self.errors.add(:severity, "is not valid")
    end
  end

  def valid_status
    if !["new", "assigned", "open", "fixed", "pending retest", "retest", "reopen", "verified", "closed", "rejected", "duplicate", "deferred", "not a bug"].include?(self.status)
      self.errors.add(:status, "is not valid")
    end
  end

  def valid_priority
    if !["low", "medium", "high"].include?(self.priority)
      self.errors.add(:priority, "is not valid")
    end
  end
# i can merge the methods between 

  # we cannot before_validation :set_close_date
  # because the close_date will always be set before the creation date (when creating a new bug)
  # which will always lead to close_date < self.created_at
  # maybe moving it to after_validation :set_close_date will be more sensible
  def set_close_date
    if self.changes.has_key?(:status) && self.status == "closed"
      self.close_date = Time.current
    elsif self.status != "closed" && self.close_date != nil
      self.close_date = nil
    end
  end

  def dates_cannot_be_in_the_past
    # if self isnt an existing record yet, make the created_at the Time today
    creation_date = (self.created_at || Time.current).in_time_zone('Eastern Time (US & Canada)').to_i

    if self.close_date.present? && self.close_date.in_time_zone('Eastern Time (US & Canada)').to_i < creation_date && self.close_date.in_time_zone('Eastern Time (US & Canada)').to_i != creation_date
      self.errors.add(:close_date, "can't be before the open date")
    end

    if self.dead_line.present? && self.dead_line.in_time_zone('Eastern Time (US & Canada)').to_i < creation_date
      self.errors.add(:dead_line, "can't be before the open date")
    end
  end

  # I don't know how to limit the amount of photos a bug can have since rails 
  # always saves the photos first before validating the Bug object...

  # def limit_photos
  #   unless Bug.find(self.id).photos.length <= 3
  #     self.errors.add(:photos, 'limited to 3')
  #   end
  # end
end
