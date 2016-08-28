require 'rails_helper'
require 'api_constraints'

RSpec.describe ApiConstraints, { type: :controller } do

  context 'when no version and default' do
    subject { ApiConstraints.new({ default: true }) }

    it 'should match' do
      expect(subject.matches?(request)).to be_truthy
    end
  end

  context 'when no version and not default' do
    subject { ApiConstraints.new({ default: false }) }

    it 'should not match' do
      expect(subject.matches?(request)).to be_falsy
    end
  end

  context 'when not a version and default' do
    before do
      api_accept_header 'not.a.version'
    end

    subject { ApiConstraints.new({ default: true }) }

    it 'should not match' do
      expect(subject.matches?(request)).to be_truthy
    end

  end

  context 'when correct version' do
    before do
      api_accept_header_version 1
    end

    subject { ApiConstraints.new({ version: 1, default: true }) }

    it 'should match' do
      expect(subject.matches?(request)).to be_truthy
    end
  end

  context 'when incorrect version' do
    before do
      api_accept_header_version 2
    end

    subject { ApiConstraints.new({ version: 1, default: true }) }

    it 'should not match' do
      expect(subject.matches?(request)).to be_falsy
    end
  end

end
