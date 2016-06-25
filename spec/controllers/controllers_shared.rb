require 'rails_helper'

RSpec.shared_examples "login required" do

  it "renders an errors json" do
    controller_response = json_response
    expect(controller_response).to have_key(:errors)
  end

  it "renders a json errors message" do
    controller_response = json_response
    expect(controller_response[:errors]).to include "Login required"
  end

  it { is_expected.to respond_with 403 }

end


RSpec.shared_examples "not found" do
  it "renders an errors json" do
    controller_response = json_response
    expect(controller_response).to have_key(:errors)
  end

  it "renders a json errors message" do
    controller_response = json_response
    expect(controller_response[:errors]).to include "Not found"
  end

  it { is_expected.to respond_with 404 }
end


RSpec.shared_examples "attribute error" do |name, message|
  it "renders an errors json" do
    controller_response = json_response
    expect(controller_response).to have_key(:errors)
  end

  it "renders a json errors message" do
    controller_response = json_response
    expect(controller_response[:errors][name]).to include message
  end

  it { is_expected.to respond_with 422 }
end


RSpec.shared_examples "general error" do |message|
  it "renders an errors json" do
    controller_response = json_response
    expect(controller_response).to have_key(:errors)
  end

  it "renders a json errors message" do
    controller_response = json_response
    expect(controller_response[:errors]).to include message
  end

  it { is_expected.to respond_with 422 }
end


RSpec.shared_examples "delete error" do |message|
  it "renders an errors json" do
    controller_response = json_response
    expect(controller_response).to have_key(:errors)
  end

  it "renders a json errors message" do
    controller_response = json_response
    expect(controller_response[:errors][:base]).to include message
  end

  it { is_expected.to respond_with 422 }
end

RSpec.shared_examples "player response" do

  it "renders json properties" do
    controller_response = json_response
    expect(controller_response).to include :name
  end
end

RSpec.shared_examples "team response" do

  it "renders json properties" do
    controller_response = json_response
    expect(controller_response).to include :name, :first_player, :second_player
  end
end

RSpec.shared_examples "doubles match response" do

  it "renders json properties" do
    controller_response = json_response
    expect(controller_response).to include :title, :first_team, :second_team, :doubles
  end
end

RSpec.shared_examples "singles match response" do

  it "renders json properties" do
    controller_response = json_response
    expect(controller_response).to include :id, :title, :first_player, :second_player, :doubles
  end
end

RSpec.shared_examples "action response" do
  it "has errors attribute" do
    controller_response = json_response
    expect(controller_response).to include :id, :title, :doubles,
                                           :actions, :errors, :sets, :state, :winner, :servers
  end

  it { is_expected.to respond_with 200 }
end

RSpec.shared_examples "doubles match scoreboard response" do

  it_behaves_like "action response"
  it "renders json properties" do
    controller_response = json_response
    expect(controller_response).to include :first_team, :second_team
  end
end

RSpec.shared_examples "singles match scoreboard response" do
  it_behaves_like "action response"
  it "renders json properties" do
    controller_response = json_response
    expect(controller_response).to include :first_player, :second_player
  end
end

RSpec.shared_examples "accepted action" do
  it_behaves_like "action response"

  it "renders errors" do
    controller_response = json_response
    expect(controller_response[:errors]).to be_empty
  end

end

RSpec.shared_examples "denied action" do
  it_behaves_like "action response"

  it "renders errors" do
    controller_response = json_response
    # expect(controller_response[:errors]).to_not eql({})
    expect(controller_response[:errors]).to_not be_empty
  end
end




