module Activitable
  extend ActiveSupport::Concern 

  included do
      has_many :activities, as: :activitable, dependent: :destroy
  end
end
