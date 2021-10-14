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
require 'test_helper'

class CommentTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end
