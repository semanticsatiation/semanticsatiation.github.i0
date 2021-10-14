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
require 'test_helper'

class ContributerTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
