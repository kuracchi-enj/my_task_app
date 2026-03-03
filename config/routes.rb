Rails.application.routes.draw do
  root "tasks#index"

  get "login", to: "sessions#new", as: :login
  post "login", to: "sessions#create"
  delete "logout", to: "sessions#destroy", as: :logout

  namespace :api do
    namespace :v1 do
      resources :tasks
      resources :categories, only: [ :index, :create, :update, :destroy ]
      resources :groups, only: [ :index, :create, :update, :destroy ]
      get "me", to: "users#me"
      get "users", to: "users#index"
    end
  end

  get "up" => "rails/health#show", as: :rails_health_check
end
