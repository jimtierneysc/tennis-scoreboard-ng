class MatchSequence < ActiveRecord::Migration
    def self.up
      execute "CREATE SEQUENCE match_number_seq START 1"
    end

    def self.down
      execute "DROP SEQUENCE match_number_seq"
    end
end
