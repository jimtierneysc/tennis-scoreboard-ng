class DropUsersTable < ActiveRecord::Migration
  def up
    drop_table :users
  end

  def down
    fail ActiveRecord::IrreversibleMigration
  end
end
