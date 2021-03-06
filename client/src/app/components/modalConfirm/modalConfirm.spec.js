(function () {
  'use strict';

  describe('modalConfirm', function () {

    var labels = {
      message: 'message value',
      title: 'title value',
      ok: 'ok value',
      cancel: 'cancel value'
    };

    beforeEach(module('app.components'));

    describe('service', function () {
      var service;
      var $uibModal;

      beforeEach(function () {

        inject(function (_modalConfirm_, _$uibModal_) {
          service = _modalConfirm_;
          $uibModal = _$uibModal_;
        })
      });

      it('should have .confirm()', function () {
        expect(service.confirm).toEqual(jasmine.any(Function));
      });

      it('should have .open()', function () {
        expect(service.open).toEqual(jasmine.any(Function));
      });

      it('should call $uibModal.open()', function () {
        var fakeOpen = function (settings) {
          expect(settings.resolve.labels).toEqual(labels);
          return {}
        };
        spyOn($uibModal, 'open').and.callFake(fakeOpen);
        service.confirm(labels);
        expect($uibModal.open).toHaveBeenCalled();
      });
    });

    describe('form elements', function () {
      var form;

      beforeEach(function () {
        form = createModal(labels).element;
      });

      it('should have <article>', function () {
        expect(form.find('article').length).toEqual(1);
      });
    });

    describe('button click', function () {
      var modal;
      var btns;
      var $rootScope;

      beforeEach(function () {
        inject(function (_$rootScope_) {
          $rootScope = _$rootScope_;
        });
        modal = createModal(labels);
        btns = modal.element.find('button');
      });

      it('should have buttons', function () {
        expect(btns.length).toBe(2);
      });

      it('should confirm when click()', function () {
        var ok = false;
        modal.modal.result.then(function () {
          ok = true;
        });
        btns[0].click();
        $rootScope.$digest();
        expect(ok).toBeTruthy();
      });

      it('should cancel when click()', function () {
        var cancel = false;
        modal.modal.result.then(
          function () {
          },
          function () {
            cancel = true;
          }
        );
        btns[1].click();
        $rootScope.$digest();
        expect(cancel).toBeTruthy();
      });

    });

    describe('form encoding', function () {
      var form;

      var labels = {
        message: '<hello>&hello'
      };

      beforeEach(function () {
        form = createModal(labels).element;
      });

      it('should html encode message', function () {
        var el = form.find('article');
        expect(el.html().trim()).toEqual('&lt;hello&gt;&amp;hello')
      });
    });

    describe('controller', function () {
      var vm;

      beforeEach(function () {
        var form = createModal(labels).element;
        vm = angular.element(form).scope().vm;
      });

      it('should have .vm', function () {
        expect(vm).not.toEqual(null);
      });

      it('should have .labels', function () {
        expect(vm.labels).toEqual(labels);
      });

      it('should have .ok()', function () {
        expect(vm.ok).toEqual(jasmine.any(Function));
      });

      it('should have .cancel()', function () {
        expect(vm.cancel).toEqual(jasmine.any(Function));
      });
    });

    function createModal(labels) {
      var service;
      var $rootScope;
      var $modalStack;
      inject(function (_modalConfirm_, _$rootScope_, _$modalStack_) {
        service = _modalConfirm_;
        $modalStack = _$modalStack_;
        $rootScope = _$rootScope_;
      });
      var modal = service.open(labels, {animation: false});
      $rootScope.$digest();
      return {
        modal: modal,
        element: angular.element($modalStack.getTop().value.modalDomEl)
      }
    }
  })

})();
