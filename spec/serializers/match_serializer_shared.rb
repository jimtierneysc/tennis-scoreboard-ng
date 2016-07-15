require 'rails_helper'

# Shared examples for testing match serialization

module MatchSerializerShared

  RSpec.shared_examples "a match" do
    it 'has id' do
      is_expected.to include :id
    end

    it 'has title' do
      is_expected.to include :title
    end

    it 'has doubles' do
      is_expected.to include :doubles
    end

    it 'has state' do
      is_expected.to include :state
    end

    it 'has scoring' do
      is_expected.to include :scoring
    end

    it 'has winner' do
      is_expected.to include :winner
    end
  end

  RSpec.shared_examples "a doubles match" do
    it_behaves_like "a match"

    it 'has doubles' do
      expect(subject[:doubles]).to eql(true)
    end
  end

  RSpec.shared_examples "a singles match" do
    it_behaves_like "a match"

    it 'has singles' do
      expect(subject[:doubles]).to eql(false)
    end
  end

  RSpec.shared_examples 'a scoreboard' do
    it 'has sets' do
      is_expected.to include :sets
    end

    it 'has actions' do
      is_expected.to include :actions
    end

    it 'errors' do
      is_expected.to include :errors
    end

    it 'has servers' do
      is_expected.to include :servers
    end
  end

  RSpec.shared_examples 'a doubles scoreboard' do
    it_behaves_like 'a doubles match'
    it_behaves_like 'a scoreboard'
  end

  RSpec.shared_examples 'a singles scoreboard' do
    it_behaves_like 'a singles match'
    it_behaves_like 'a scoreboard'
  end

  RSpec::Matchers.define :include do |member|
    match do |json|
      json.include? member
    end

    failure_message do
      "expect to include #{member}"
    end

    failure_message_when_negated do
      "do not expect to include #{member}"
    end
  end

  RSpec::Matchers.define :eql_match do |match|
    match do |json|
      @helper = MatchEql.new(json, match)

      h = @helper
      h.eql_member :id
      h.eql_member :doubles
      h.eql_member_to_s :scoring
      h.eql_member_to_s :state
      h.eql_member_to_s :title
      if match.doubles
        h.eql_team :first_team
        h.eql_team :second_team
        h.record_result :winner, json[:winner].nil? || json[:winner] == match.team_winner.id
      else
        h.eql_team :first_player
        h.eql_team :second_player
      end
      !h.failures?
    end

    failure_message do
      @helper.failure_message
    end

    failure_message_when_negated do
      "do not expect to match json"
    end
  end

  class MatchEql

    def initialize(json, match)
      @not_equal = []
      @json = json
      @match = match
    end

    attr_reader :not_equal
    attr_reader :json
    attr_reader :match

    def eql_member member
      record_result member, json[member] == match.send(member)
    end

    def eql_member_to_s member
      record_result member, json[member] == match.send(member).to_s
    end

    def eql_team opponent
      record_result "#{opponent}.id", json[opponent][:id] == match.send(opponent).id
      record_result "#{opponent}.name", json[opponent][:name] == match.send(opponent).name
    end

    def record_result member, result
      not_equal.push member unless result
    end

    def failure_message
      "expect members to match: #{not_equal.to_s}"
    end

    def failures?
      !not_equal.empty?
    end
  end
end

RSpec.configure do |c|
  c.extend MatchSerializerShared, match_serializer_shared: true
end