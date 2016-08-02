(function () {
  'use strict';

  describe('api constants', function () {

    var baseURL, playersResource, teamsResource, matchesResource,
      scoreboardResource, authHeaderName;

    beforeEach(module('frontendApi'));

    beforeEach(inject(function (_baseURL_, _authHeaderName_, _playersResource_,
                                _teamsResource_, _matchesResource_, _scoreboardResource_) {
      baseURL = _baseURL_;
      authHeaderName = _authHeaderName_;
      teamsResource = _teamsResource_;
      playersResource = _playersResource_;
      matchesResource = _matchesResource_;
      scoreboardResource = _scoreboardResource_;
    }));

    it('should have .baseURL', function () {
      expect(baseURL).toEqual('/api/');
    });

    it('should have .teamsResource', function () {
      expect(teamsResource).toEqual('teams');
    });

    it('should have .playersResource', function () {
      expect(playersResource).toEqual('players');
    });

    it('should have .matchesResource', function () {
      expect(matchesResource).toEqual('matches');
    });

    it('should have .scoreboardResource', function () {
      expect(scoreboardResource).toEqual('match_score_board');
    });

    it('should have .authHeaderName', function () {
      expect(authHeaderName).toEqual('Authorization');
    });

  });
})();

