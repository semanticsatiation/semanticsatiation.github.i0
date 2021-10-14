Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  root "static_pages#root"

  defaults format: :json do
    resources :notifications, only: [:index, :update]

    resources :users, only: [:index, :create, :destroy, :update]

    resources :activities, only: [:index]

    resources :organizations, only: [:destroy, :update]

    # nesting relationships with :create when the parent is not current_user
    resources :organizations, only: [:index, :show, :create] do
      resources :projects, only: [:index, :show, :create, :update, :destroy]
    end

    resources :projects, only: [] do
      resources :project_contributers, only: [:index, :create, :update, :destroy]

      resources :bugs, only: [:index, :show, :create, :update, :destroy] do
        resources :activities, only: [:index]
        resources :comments, only: [:index, :create, :update, :destroy]
      end

      resources :activities, only: [:index]
    end

    resource :session, only: [:create, :destroy]
    # resource only adds the URL path with no ids
  end
end