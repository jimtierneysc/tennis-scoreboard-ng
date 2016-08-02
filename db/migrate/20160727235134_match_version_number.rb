class MatchVersionNumber < ActiveRecord::Migration
  def self.up
    execute "CREATE SEQUENCE play_version_seq START 1"
  end

  def self.down
    execute "DROP SEQUENCE play_version_seq"
  end
end
