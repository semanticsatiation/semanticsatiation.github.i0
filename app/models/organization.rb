# == Schema Information
#
# Table name: organizations
#
#  id         :bigint           not null, primary key
#  name       :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  user_id    :bigint
#
# Indexes
#
#  index_organizations_on_name     (name)
#  index_organizations_on_user_id  (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (user_id => users.id)
#
class Organization < ApplicationRecord
  belongs_to :manager,
    class_name: "User",
    foreign_key: :user_id

  has_many :projects, dependent: :destroy

  validates :name, presence: true
  validates :name, length: { :maximum => 30 }

  validate :forbid_names

  def forbid_names
    if ["Personal Projects", "Contributed Projects"].include?(self.name)
      self.errors.add(:organization, "Organization name is reserved")
    end
  end
end
