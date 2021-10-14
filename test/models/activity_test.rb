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
require 'test_helper'

class ActivityTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
