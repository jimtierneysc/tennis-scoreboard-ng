class TeamSequence < ActiveRecord::Migration
  def self.up
    execute "CREATE SEQUENCE team_number_seq START 1"
  end

  def self.down
    execute "DROP SEQUENCE team_number_seq"
  end
end
