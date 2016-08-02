class MatchVersionField < ActiveRecord::Migration
  def change
    add_column :matches, :play_version, :integer
  end
end
