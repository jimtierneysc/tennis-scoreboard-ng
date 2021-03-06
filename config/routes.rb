require 'api_constraints'

Rails.application.routes.draw do

  scope '/api', constraints: { format: 'json' } do
    scope module: :v1, constraints: ApiConstraints.new(version: 1, default: true) do
      get 'user' => 'user#show'
      resources :sessions, only: [:create, :destroy]
      resources :players, except: [:new, :edit]
      resources :teams, except: [:new, :edit]
      resources :matches, except: [:new, :edit]
      resources :match_scoreboard, only: [:show]
      post 'match_scoreboard/:id' => 'match_scoreboard#update'
    end
  end

end

