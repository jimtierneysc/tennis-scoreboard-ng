require 'rails_helper'

module ControllersShared

  def self.message_text(id)
    if id.is_a?(Symbol)
      case id
      when :cant_be_blank
        'can\'t be blank'
      when :already_taken
        'has already been taken'
      when :not_found
        'not found'
      end
    else
      id.to_s
    end
  end

  def self.exclude_attribute(obj, exclude)
    attributes = obj.clone
    attributes.delete(exclude)
    attributes
  end

  def self.change_attribute(obj, name, value)
    attributes = obj.clone
    attributes[name] = value
    attributes
  end


  RSpec::Matchers.define :include_error do |message|
    match do |json|
      @text = ControllersShared::message_text(message)
      json.key?(:errors) && json[:errors] == @text
    end

    failure_message do
      "expect response to include error: #{@text}"
    end

    failure_message_when_negated do
      "do not expect response to include error: #{@text}"
    end
  end

  RSpec::Matchers.define :include_error_named do |name, message|
    match do |json|
      @text = ControllersShared::message_text(message)
      json.key?(:errors) && json[:errors].key?(name) && json[:errors][name][0] == @text
    end

    description do
      "include error :#{name} with value of \"#{ControllersShared::message_text(message)}\""
    end

    failure_message do
      "expect response to include error: #{@text}"
    end

    failure_message_when_negated do
      "do not expect response to include error: #{@text}"
    end
  end

  RSpec::Matchers.define :have_errors do
    match do |json|
      json.key?(:errors) && !json[:errors].empty?
    end

    failure_message do
      "expect to have errors"
    end

    failure_message_when_negated do
      "do not expect to have errors"
    end
  end

  RSpec.shared_examples 'a response with success code' do |code|
    it { is_expected.to respond_with code }
  end

  RSpec.shared_examples 'a response with error code' do |code|
    it { is_expected.to respond_with code }
  end

  RSpec.shared_examples 'login required' do
    it { expect(json_response).to include_error 'Login required' }

    it_behaves_like 'a response with error code', 403
  end

  RSpec.shared_examples 'not authenticated' do
    it { expect(json_response).to include_error 'Not authenticated' }

    it_behaves_like 'a response with error code', 401
  end

  RSpec.shared_examples 'not found' do
    it { expect(json_response).to include_error 'Not found' }

    it_behaves_like 'a response with error code', 404
  end

  RSpec.shared_examples 'attribute error' do |name, message|
    it { expect(json_response).to include_error_named name, message }

    it_behaves_like 'a response with error code', 422
  end

  RSpec.shared_examples 'general error' do |message|
    it { expect(json_response).to include_error message }

    it_behaves_like 'a response with error code', 422
  end

  RSpec.shared_examples 'an error when delete referenced entity' do |message|
    it { expect(json_response).to include_error_named :base, message }

    it { is_expected.to respond_with 422 }
  end

  RSpec.shared_examples 'player response' do
    it { expect(json_response).to include :id, :name }
  end

  RSpec.shared_examples 'player list response' do
    it { expect(json_response[0]).to include :id, :name }
  end

  RSpec.shared_examples 'team response' do
    it { expect(json_response).to include :id, :name, :first_player, :second_player }
  end

  RSpec.shared_examples 'team list response' do
    it { expect(json_response[0]).to include :id, :name, :first_player, :second_player }
  end

  RSpec.shared_examples 'doubles match response' do
    it { expect(json_response).to include :id, :title, :first_team, :second_team, :doubles }
  end

  RSpec.shared_examples 'doubles teams' do
    describe('first_team') do
      subject { Team.find_by_id(json_response[:first_team][:id]) }

      it { is_expected.not_to be_nil }

      it { expect(subject.doubles).to be_truthy }
    end

    describe('second_team') do
      subject { Team.find_by_id(json_response[:second_team][:id]) }

      it { is_expected.not_to be_nil }

      it { expect(subject.doubles).to be_truthy }
    end
  end

  RSpec.shared_examples 'match list response' do
    it { expect(json_response[0]).to include :id, :title, :doubles }
  end

  RSpec.shared_examples 'singles match response' do
    it { expect(json_response).to include :id, :title, :first_player, :second_player, :doubles }
  end

  RSpec.shared_examples 'singles players' do
    describe('first_player') do
      subject { Player.find_by_id(json_response[:first_player][:id]) }

      it { is_expected.not_to be_nil }
    end

    describe('second_player') do
      subject { Player.find_by_id(json_response[:second_player][:id]) }

      it { is_expected.not_to be_nil }
    end
  end

  RSpec.shared_examples 'action response' do
    it do
      expect(json_response).to include :id, :title, :doubles,
                                       :actions, :errors, :sets, :state, :winner, :servers
    end

    it { is_expected.to respond_with 200 }
  end

  RSpec.shared_examples 'doubles match scoreboard response' do
    it_behaves_like 'action response'
    it { expect(json_response).to include :first_team, :second_team }
  end

  RSpec.shared_examples 'singles match scoreboard response' do
    it_behaves_like 'action response'
    it { expect(json_response).to include :first_player, :second_player }
  end

  RSpec.shared_examples 'accepted action' do
    it { expect(json_response).not_to have_errors }
  end

  RSpec.shared_examples 'denied action' do
    it { expect(json_response).to have_errors }
  end
end

RSpec.configure do |c|
  c.extend ControllersShared, type: :controller
end




