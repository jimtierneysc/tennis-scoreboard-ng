Rails.application.routes.draw do
  devise_for :users, skip: :sessions

  # constrain to api/players.json or api/players, for example
  scope '/api', constraints: { format: 'json' } do
    resources :users, :only => [:show, :create, :update, :destroy]
    resources :sessions, :only => [:create, :destroy]
    resources :players, except: [:new, :edit]
    resources :teams, except: [:new, :edit]
    resources :matches, except: [:new, :edit]
    resources :match_score_board, only: [:show]
    post 'match_score_board/:id' => 'match_score_board#update'
  end
end
