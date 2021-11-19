class UsersController < ApplicationController
    skip_before_action :must_be_signed_in!, only: [:create]
    before_action only: [:update, :destroy] do
        must_not_be_guest!(params[:id])
    end
    before_action :must_be_profile_owner!, except: [:index, :create]
    before_action :set_project, only: [:index]

    def index
        @users = User.where.not(id: @project.worker_ids).with_attached_photo

        if filter_string
            @users = @users.where("username ilike ?", "%#{filter_string}%").order(Arel.sql("LOWER(username)"))
        end

        @all_users_count = @users.size

        @users = @users.limit(18).offset(18 * off_set)

        render :index
    end

    def create
        @user = User.new(user_params.except(:photo))

        if validate?
            validate(@user)
        else
            if @user.save
                log_in!(@user)
                render "sessions/session"
            else
                render json: @user.errors, status: 422
            end  
        end
    end

    def update
        # I need to figure out how to validate this because validation for photos are a little
        # different since proper validation can only take place when a photo is already attached 
        # to a model...

        # I need to completely avoid that!

        @user = User.find(params[:id])
        @user.assign_attributes(user_params.except(:photo, :password))
        @user.valid?

        if validate?
            if photo_is_present?
                validate_photo(@user, photo)
            elsif password_is_present?
                @user.validate_new_password(user_object)
            end

            if @user.errors.none?
                render json: {}
            else
                render json: @user.errors, status: 422
            end
        else
            if photo_is_present?
                validate_photo(@user, photo)

                if @user.errors.details[:photo].none?
                    if @user.photo.attached?
                        @user.photo.purge
                    end

                    @user.photo.attach(photo)
                end
                # if the photo passes all validations, purge any photos (if any)
                # a user currently possesses and let the user update to the new photo (@user.update(user_params))
            elsif password_is_present?
                @user.validate_new_password(user_object, true)

                if @user.errors.details[:password].none?
                    @user.assign_attributes(password: user_object[:password])
                end
            end

            if @user.errors.none? && @user.save
                render @user
            else
                render json: @user.errors, status: 422
            end
        end
    end

    def destroy
        @user = User.find(params[:id])
        if @user && @user == current_user
            if @user.photo.attached?
                @user.photo.purge
            end

            log_out!

            @user.destroy

            render json: ["Goodbye. Forever!"]
        else
            render json: {}, status: 404
        end
    end

private
    def user_params
        params.require(:user).permit(:username, :password, :photo, :biography, :theme)
    end

    def must_not_be_guest!(id)
        to_be_updated = params[:user].keys.first

        if User.find(id).guest && !["photo", "theme", "biography"].include?(to_be_updated)
            render json: {"#{to_be_updated}": ["can not be changed as a guest"]}, status: 422
        end
    end

    def must_be_profile_owner!
        is_not_owner_or_parent?(User.find(params[:id]))
    end

    # photos must be stopped when they fail validations but Active Storage
    # doesn't currently stop the upload to AWS S3 so I need to stop it here
    # these validations only happen when a user is updated

    # Update: I needed to completely prevent the photo being attached to the user
    # instead of purging after it has already been attached when validations failed
    # That's why i moved it to the controller, to completely stop an invalid photo
    # from ever reaching the user
    def validate_photo(user, photo)
        if photo == "undefined"
            user.errors.add(:photo, "must be present")
        else
            [photo.content_type.in?(User::VALID_PHOTO_FORMATS), photo.size <= 1000000].each_with_index do |test, ind| 
                unless test
                    user.errors.add(:photo, User::PHOTO_VALIDATIONS[ind])
                end
            end
        end
    end

    def photo_is_present?
        params[:user].has_key?(:photo)
    end

    def user_object
        params[:user]
    end

    def password_is_present?
        params[:user].has_key?(:password)
    end

    def photo
        params[:user][:photo]
    end
end
