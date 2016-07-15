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


  RSpec.shared_examples 'login required' do

    it 'renders an errors json' do
      expect(json_response).to have_key(:errors)
    end

    it 'renders a json errors message' do
      expect(json_response[:errors]).to include 'Login required'
    end

    it { is_expected.to respond_with 403 }
  end

  RSpec.shared_examples 'not found' do
    it 'renders an errors json' do
      expect(json_response).to have_key(:errors)
    end

    it 'renders a json errors message' do
      expect(json_response[:errors]).to include 'Not found'
    end

    it { is_expected.to respond_with 404 }
  end

  RSpec.shared_examples 'attribute error' do |name, message|
    it 'renders an errors json' do
      expect(json_response).to have_key(:errors)
    end

    it 'renders a json errors message' do
      expect(json_response[:errors][name]).to include ControllersShared::message_text(message)
    end

    it { is_expected.to respond_with 422 }
  end

  RSpec.shared_examples 'general error' do |message|
    it 'renders an errors json' do
      expect(json_response).to have_key(:errors)
    end

    it 'renders a json errors message' do
      expect(json_response[:errors]).to include ControllersShared::message_text(message)
    end

    it { is_expected.to respond_with 422 }
  end


  RSpec.shared_examples 'delete error' do |message|
    it 'renders an errors json' do
      expect(json_response).to have_key(:errors)
    end

    it 'renders a json errors message' do
      expect(json_response[:errors][:base]).to include ControllersShared::message_text(message)
    end

    it { is_expected.to respond_with 422 }
  end

  RSpec.shared_examples 'player response' do
    it 'renders json properties' do
      expect(json_response).to include :id, :name
    end
  end

  RSpec.shared_examples 'player list response' do
    it 'renders json properties' do
      expect(json_response[0]).to include :id, :name
    end
  end

  RSpec.shared_examples 'team response' do

    it 'renders json properties' do
      expect(json_response).to include :id, :name, :first_player, :second_player
    end
  end

  RSpec.shared_examples 'team list response' do

    it 'renders json properties' do
      expect(json_response[0]).to include :id, :name, :first_player, :second_player
    end
  end

  RSpec.shared_examples 'doubles match response' do

    it 'renders json properties' do
      expect(json_response).to include :id, :title, :first_team, :second_team, :doubles
    end
  end

  RSpec.shared_examples 'match list response' do

    it 'renders json properties' do
      expect(json_response[0]).to include :id, :title, :doubles
    end
  end

  RSpec.shared_examples 'singles match response' do

    it 'renders json properties' do
      expect(json_response).to include :id, :title, :first_player, :second_player, :doubles
    end
  end

  RSpec.shared_examples 'action response' do
    it 'has errors attribute' do
      expect(json_response).to include :id, :title, :doubles,
                                       :actions, :errors, :sets, :state, :winner, :servers
    end

    it { is_expected.to respond_with 200 }
  end

  RSpec.shared_examples 'doubles match scoreboard response' do

    it_behaves_like 'action response'
    it 'renders json properties' do
      expect(json_response).to include :first_team, :second_team
    end
  end

  RSpec.shared_examples 'singles match scoreboard response' do
    it_behaves_like 'action response'
    it 'renders json properties' do
      expect(json_response).to include :first_player, :second_player
    end
  end

  RSpec.shared_examples 'accepted action' do
    it_behaves_like 'action response'

    it 'renders errors' do
      expect(json_response[:errors]).to be_empty
    end

  end

  RSpec.shared_examples 'denied action' do
    it_behaves_like 'action response'

    it 'renders errors' do
      expect(json_response[:errors]).to_not be_empty
    end
  end

end

RSpec.configure do |c|
  c.extend ControllersShared, type: :controller
end




