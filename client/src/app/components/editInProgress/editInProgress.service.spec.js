(function () {
  'use strict';

  describe('editInProgress service', function () {
    var service;
    var modalConfirm;
    var $rootScope;
    var $q;
    var $timeout;

    beforeEach(module('app.components'));

    beforeEach(function () {
      inject(function (_editInProgress_, _modalConfirm_, _$rootScope_, _$q_,
      _$timeout_) {
        service = _editInProgress_;
        modalConfirm = _modalConfirm_;
        $rootScope = _$rootScope_;
        $q = _$q_;
        $timeout = _$timeout_;
      })
    });

    it('should be an object', function () {
      expect(service).toEqual(jasmine.any(Object));
    });

    it('should have .closeEditors()', function () {
      expect(service.closeEditors).toEqual(jasmine.any(Function));
    });

    it('should have .registerOnQueryState()', function () {
      expect(service.registerOnQueryState).toEqual(jasmine.any(Function));
    });

    it('should have .registerOnConfirmed()', function () {
      expect(service.registerOnConfirmed).toEqual(jasmine.any(Function));
    });

    it('should have .registerOnClose()', function () {
      expect(service.registerOnClose).toEqual(jasmine.any(Function));
    });


    describe('closeEditors', function () {
      var resolvePromise = false;
      var confirmed;
      var close;
      var onFocus;
      var pristine = false;
      var title = '';
      var text = '';
      beforeEach(function () {
        spyOn(modalConfirm, 'confirm').and.callFake(returnPromise());
        service.registerOnQueryState($rootScope, queryState);
        confirmed = jasmine.createSpy('confirmed');
        service.registerOnConfirmed($rootScope, confirmed);
        close = jasmine.createSpy('close');
        service.registerOnClose($rootScope, close);
        // Capture event sent by autoFocus service
        onFocus = jasmine.createSpy('focus');
        var on = $rootScope.$on('fe-autoFocus', onFocus);
        $rootScope.$on('$destroy', on);
      });

      function returnPromise() {
        return function () {
          var deferred = $q.defer();
          if (resolvePromise)
            deferred.resolve();
          else
            deferred.reject();
          return deferred.promise;
        }
      }

      function queryState(event, state) {
        state.pristine = pristine;
        state.autoFocus = 'abc';  // related to fe-auto-focus directive
        state.autoFocusScope = $rootScope.$new();
        state.labels.title = title;
        state.labels.text = text;
      }

      describe('when edit in progress', function () {

        describe('do close', function () {
          beforeEach(function () {
            pristine = false;  // changes
            resolvePromise = true; // accept close
            service.closeEditors();
            $rootScope.$digest();
          });

          it('should send close event', function () {
            expect(close).toHaveBeenCalled();
          });

          it('should send confirmed event', function () {
            expect(confirmed).toHaveBeenCalled();
          });

          it('should not set focus after close', function () {
            $timeout.flush();
            expect(onFocus).not.toHaveBeenCalled();
          });

        });

        describe('reject close', function () {
          beforeEach(function () {
            pristine = false;  // changes
            resolvePromise = false; // reject close
            service.closeEditors();
            $rootScope.$digest();
          });

          it('should not send close event', function () {
            expect(close).not.toHaveBeenCalled();
          });

          it('should send confirmed event', function () {
            expect(confirmed).toHaveBeenCalled();
          });

          it('should set focus after reject', function () {
            $timeout.flush();
            expect(onFocus).toHaveBeenCalled();
          });
        });
      });

      describe('when edit not in progress', function () {
        beforeEach(function () {
          pristine = true;  // No changes
          service.closeEditors();
        });

        it('should send close event', function () {
          expect(close).toHaveBeenCalled();
        });

        it('should  send confirmed event', function () {
          expect(confirmed).not.toHaveBeenCalled();
        });
      })
    });
  });
})();

