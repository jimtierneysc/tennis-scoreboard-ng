(function () {
  'use strict';

  describe('api constants', function () {

    var apiPath, playersPath, teamsPath, matchesPath,
      scoreboardPath, authHeaderName, sessionsPath;

    beforeEach(module('frontendApi'));

    beforeEach(inject(function (_apiPath_, _authHeaderName_, _playersPath_,
                                _teamsPath_, _matchesPath_, _scoreboardPath_,
                                _sessionsPath_) {
      apiPath = _apiPath_;
      authHeaderName = _authHeaderName_;
      teamsPath = _teamsPath_;
      playersPath = _playersPath_;
      matchesPath = _matchesPath_;
      scoreboardPath = _scoreboardPath_;
      sessionsPath = _sessionsPath_;
    }));

    it('should have .apiPath', function () {
      expect(apiPath).toEqual('/api/');
    });

    it('should have .teamsPath', function () {
      expect(teamsPath).toEqual('teams');
    });

    it('should have .sessionsPath', function () {
      expect(sessionsPath).toEqual('sessions');
    });

    it('should have .playersPath', function () {
      expect(playersPath).toEqual('players');
    });

    it('should have .matchesPath', function () {
      expect(matchesPath).toEqual('matches');
    });

    it('should have .scoreboardPath', function () {
      expect(scoreboardPath).toEqual('match_score_board');
    });

    it('should have .authHeaderName', function () {
      expect(authHeaderName).toEqual('Authorization');
    });

  });
})();

