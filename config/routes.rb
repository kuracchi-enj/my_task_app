Rails.application.routes.draw do
  root "tasks#index"

  namespace :api do
    namespace :v1 do
      resources :tasks
      resources :categories, only: [ :index, :create, :update, :destroy ]
    end
  end

  get "up" => "rails/health#show", as: :rails_health_check
end
