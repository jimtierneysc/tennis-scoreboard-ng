class DropMatchGroupColumn < ActiveRecord::Migration
  def change
    remove_column :matches, :match_group_id
  end
end
