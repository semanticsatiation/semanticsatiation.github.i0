# == Schema Information
#
# Table name: users
#
#  id              :bigint           not null, primary key
#  biography       :text             default(""), not null
#  password_digest :string           not null
#  session_token   :string           not null
#  theme           :string           default("Default"), not null
#  username        :string           default(""), not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_users_on_session_token  (session_token) UNIQUE
#  index_users_on_username       (username) UNIQUE
#
class User < ApplicationRecord
  has_secure_password
  # covers password_digest being blank

  has_many :projects, dependent: :destroy

  has_many :organizations, dependent: :destroy

  has_many :bugs, dependent: :destroy

  has_many :project_contributions,
    class_name: "ProjectContributer",
    foreign_key: :user_id,
    dependent: :destroy

  has_many :bug_contributions,
    class_name: "BugContributer",
    foreign_key: :user_id,
    dependent: :destroy

  has_many :comments,
    class_name: "Comment",
    foreign_key: :user_id,
    dependent: :destroy

  has_many :notifications, foreign_key: :recipient_id, dependent: :destroy

  has_one_attached :photo

  PASSWORD_FORMAT = [
      "(?=.{6,})", # Must contain 8 or more characters
      "(?=.*\\d)", # Must contain a digit
      "(?=.*[a-z])", # Must contain a lower case character
      "(?=.*[A-Z])", # Must contain an upper case character
      "(?=.*[[:^alnum:]])", # Must contain a symbol
  ]

  PASSWORD_REQUIREMENTS = [
    "needs to be 6 or more characters",
    "should have a digit",
    "should have a lower case character",
    "should have a upper case character",
    "should have symbol",
  ]

  VALID_PHOTO_FORMATS = %w(image/jpeg image/png image/jpg)

  PHOTO_VALIDATIONS = {
    0 => "must be a JPG, JPEG or PNG",
    1 => "size is not less than or equal to 1 megabyte"
  }

  validates :username, :session_token, presence: true
  validates :username, :session_token, uniqueness: true
  validates :username, length: { :minimum => 5, :maximum => 25 }
  
  # put between in a method???
  validates_format_of :username, with: /\A\w*\z/, message: "no special characters except underscores (_)"
  validates_format_of :username, without: /((_)\2{1,})/, message: "no consecutive underscores: '____'"
  validates_format_of :username, without: /\s/, message: "must contain no spaces"
  # put between in a method???

  validates :biography, length: { :maximum => 150 }
  validate :password_requirements
  # validates :password_digest, presence: true
  # covered by has_secure_password

  # validates :password, allow_nil: true
  # figure out how to validate a password the right way
  # i need to somehow use password_requirements(password) or use something else
  # that covers PASSWORD_REQUIREMENTS (validate :password_requirements)

  before_validation :ensure_session_token

  before_validation :ensure_valid_theme

  before_validation :downcase_username

  after_create :create_default_organizations

  attr_reader :password

  def self.generate_session_token
    loop do
      # keep creating a new session_token until one is made that doesn't exist in the database
      new_session_token = SecureRandom.urlsafe_base64(nil, false)
      break new_session_token unless User.exists?(session_token: new_session_token)
    end
  end

  def self.find_by_credentials(username, password)
    user = User.find_by(username: username.downcase)
    user if user && user.is_password?(password)
  end

  def password=(new_password)
    unless new_password.blank?
      @password = new_password
      # remove all spaces

      self.password_digest = BCrypt::Password.create(new_password)

      nil
    end
  end

  # condition needs to be "if password already exists"
  # this condition should probably come before unless new_password.blank?
  # this is how we tell the difference between a creating
  # a password for the first time and updating an existing password 
  # receive password object that has new_password
  # old_password and password_confirmation; throw errors based on mistakes 
  def validate_new_password(user_object, is_submission = false)
    @password = user_object[:password]
    
    # check if new password is valid
    # I would do self.valid? instead of password_requirements BUT this overwrites all the errors that 
    # were added prior to this method call
    # photos and changing passwords makes adding errors to self
    # a little more complicated than usual
    password_requirements

    if is_submission
      unless self.is_password?(user_object[:old_password])
        self.errors.add(:old_password, "does not match your current password")
      end

      if self.is_password?(@password)
        self.errors.add(:password, "should not be your old password")
      end
    end

    if user_object[:old_password].blank?
      self.errors.add(:old_password, "can't be blank")
    end

    if @password.blank?
      self.errors.add(:password, "can't be blank")
    end

    if user_object[:password_confirmation].blank?
      self.errors.add(:password_confirmation, "can't be blank")
    end

    if @password != user_object[:password_confirmation]
      self.errors.add(:password_confirmation, "does not match new password")
    end
  end

  def reset_session_token!
    self.session_token = User.generate_session_token

    self.save!

    self.session_token
  end

  def is_password?(guessed_password)
    BCrypt::Password.new(self.password_digest).is_password?(guessed_password)
  end

  def public_project_contributions
    Project.joins(:project_contributers)
    .select("projects.*, project_contributers.id AS project_contributer_id, project_contributers.created_at AS join_date")
    .where(:project_contributers => {user_id: self.id, contributed: true, pending: false})

=begin
    OLD WAY

    projects.* differentiates similar attributes from projects and project_contributers
    Project.select("projects.*")
      .joins(:project_contributers)
      .where(:project_contributers => {user_id: self.id})
      .where.not(:project_contributers => {project_id: self.project_ids})

    "SELECT projects.*, project_contributers.created_at AS join_date 
    FROM projects INNER JOIN project_contributers ON project_contributers.project_id = projects.id 
    WHERE project_contributers.user_id = $1 AND project_contributers.project_id NOT IN () AND (name ilike '%%') 
    ORDER BY join_date DESC"
      :project_contributers => {} is used to let ActiveRecord understand
      we are reffering to an attribute from project_contributers and not projects

    how i orginally had it (NOT IN (?) is the problem):
    this doesnt work when a user has contributed to a project but hasn't created a project
    it only returns the correct results only if a user has already created a project

    Project.find_by_sql(["SELECT projects.* FROM projects
    JOIN project_contributers ON projects.id = project_contributers.project_id
    WHERE project_contributers.user_id = ? AND project_contributers.project_id NOT IN (?)", self.id, self.projects.map(&:id)])
=end
  end

  
private
  def password_requirements
    if @password
      PASSWORD_FORMAT.each_with_index do |reg, ind| 
        unless Regexp.new(reg).match?(@password)
          self.errors.add(:password, PASSWORD_REQUIREMENTS[ind])
        end
      end
    end
  end

  def downcase_username
    self.username.downcase!
  end

  def ensure_valid_theme
    unless ["Default", "Dark", "Creamy", "Blueberry", "FireFly", "Halloween"].include?(self.theme)
      self.theme = "Default"
    end
  end

  def ensure_session_token
    self.session_token ||= User.generate_session_token
  end

  def create_default_organizations
      # skip validations for the first organizations since they
      # will trigger errors otherwise
      personal_organization = self.organizations.new(name: 'Personal Projects')
      contributed_organization = self.organizations.new(name: 'Contributed Projects')
      personal_organization.save(validate: false)
      contributed_organization.save(validate: false)
      # after these records are created, they should no longer be 
      # duplicated or modified in any way
  end
end
