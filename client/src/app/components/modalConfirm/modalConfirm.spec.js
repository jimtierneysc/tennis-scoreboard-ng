(function () {
  'use strict';

  describe('service modalConfirm', function () {

    var labels = {
      text: 'text value',
      title: 'title value',
      ok: 'ok value',
      cancel: 'cancel value'
    };

    beforeEach(module('frontend'));

    describe('service', function () {
      var service;
      var $uibModal;

      beforeEach(function () {

        inject(function (_modalConfirm_, _$uibModal_) {
          service = _modalConfirm_;
          $uibModal = _$uibModal_;
        })
      });

      it('should be registered', function () {
        expect(service).not.toEqual(null);
      });

      it('should have confirm function', function () {
        expect(service.confirm).toEqual(jasmine.any(Function));
      });

      it('should call confirm function', function () {
        var fakeOpen = function (settings) {
          expect(settings.resolve.data).toEqual(labels);
          return {result: true}
        };
        spyOn($uibModal, 'open').and.callFake(fakeOpen);
        var result = service.confirm(labels);
        expect(result).toBe(true);
        expect($uibModal.open).toHaveBeenCalled();
      });

    });
    
    describe('form elements', function () {
      var form;

      beforeEach(function () {
        form = createModal(labels);
      })

      afterEach(function () {
        destroyModal();
      })

      it('should find elements', function () {
        expect(form.find('article').length).toEqual(1);
        expect(form.find('header').length).toEqual(1);
        expect(form.find('footer').length).toEqual(1);

      });
    });

    describe('form encode', function () {
      var form;

      var labels = {
        text: '<hello>&hello'
      };

      beforeEach(function () {
        form = createModal(labels);
      })

      afterEach(function () {
        destroyModal();
      })

      it('should encode text', function () {
        var el = form.find('article');
        expect(el.html().trim()).toEqual('&lt;hello&gt;&amp;hello')
      });
    });

    describe('vm', function () {
      var vm;
      
      beforeEach(function () {
        var form = createModal(labels);
        vm = angular.element(form).scope().vm;
      })

      afterEach(function () {
        destroyModal();
      })

      it('should have members', function () {
        expect(vm).not.toEqual(null);
        expect(vm.data).toEqual(jasmine.any(Object));
        expect(vm.data).toEqual(labels);
        expect(vm.ok).toEqual(jasmine.any(Function));
        expect(vm.cancel).toEqual(jasmine.any(Function));
      })
    });

    function createModal(labels) {
      var service;
      var $rootScope;
      var $modalStack;
      inject(function (_modalConfirm_, _$rootScope_, _$modalStack_) {
        service = _modalConfirm_;
        $modalStack = _$modalStack_;
        $rootScope = _$rootScope_;
      })
      var form = service.open(labels, {animation: false});
      form.rendered
        .then(function () {
        });

      // Propagate promise resolution to 'then' functions using $apply().
      $rootScope.$apply();
      return angular.element($modalStack.getTop().value.modalDomEl);
    }

    function destroyModal() {
      var $modalStack;
      inject(function (_$modalStack_) {
        $modalStack = _$modalStack_;
      })
      $modalStack.dismissAll();
    }
    
  })

})();
