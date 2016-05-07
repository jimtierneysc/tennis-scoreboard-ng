class CopySchema < ActiveRecord::Migration
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "match_sets", force: :cascade do |t|
    t.integer  "match_id",       null: false
    t.integer  "ordinal",        null: false
    t.datetime "created_at",     null: false
    t.datetime "updated_at",     null: false
    t.string   "scoring",        null: false
    t.integer  "team_winner_id"
  end

  add_index "match_sets", ["match_id", "ordinal"], name: "index_match_sets_on_match_id_and_ordinal", using: :btree

  create_table "matches", force: :cascade do |t|
    t.datetime "created_at",                              null: false
    t.datetime "updated_at",                              null: false
    t.integer  "first_team_id",                           null: false
    t.integer  "second_team_id",                          null: false
    t.integer  "match_group_id"
    t.string   "scoring",                                 null: false
    t.boolean  "started",                 default: false, null: false
    t.boolean  "doubles",                 default: false, null: false
    t.integer  "first_player_server_id"
    t.integer  "second_player_server_id"
    t.string   "title"
    t.integer  "team_winner_id"
  end

  add_index "matches", ["title"], name: "match_title", unique: true, using: :btree

  create_table "players", force: :cascade do |t|
    t.string   "name",       null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_index "players", ["name"], name: "player_first_name", unique: true, using: :btree

  create_table "set_games", force: :cascade do |t|
    t.integer  "ordinal",                          null: false
    t.integer  "match_set_id",                     null: false
    t.integer  "team_winner_id"
    t.datetime "created_at",                       null: false
    t.datetime "updated_at",                       null: false
    t.integer  "player_server_id"
    t.boolean  "tiebreaker",       default: false, null: false
  end

  add_index "set_games", ["match_set_id", "ordinal"], name: "index_set_games_on_match_set_id_and_ordinal", using: :btree

  create_table "teams", force: :cascade do |t|
    t.string   "name"
    t.integer  "first_player_id",                  null: false
    t.integer  "second_player_id"
    t.datetime "created_at",                       null: false
    t.datetime "updated_at",                       null: false
    t.boolean  "doubles",          default: false, null: false
  end

  add_index "teams", ["name"], name: "team_name", unique: true, using: :btree

  create_table "users", force: :cascade do |t|
    t.string   "username"
    t.string   "password_digest"
    t.datetime "created_at",      null: false
    t.datetime "updated_at",      null: false
  end

  add_foreign_key "match_sets", "matches"
  add_foreign_key "match_sets", "teams", column: "team_winner_id"
  add_foreign_key "matches", "players", column: "first_player_server_id"
  add_foreign_key "matches", "players", column: "second_player_server_id"
  add_foreign_key "matches", "teams", column: "first_team_id"
  add_foreign_key "matches", "teams", column: "second_team_id"
  add_foreign_key "matches", "teams", column: "team_winner_id"
  add_foreign_key "set_games", "match_sets"
  add_foreign_key "teams", "players", column: "first_player_id"
  add_foreign_key "teams", "players", column: "second_player_id"
end
