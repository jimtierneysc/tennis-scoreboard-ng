(function () {
  'use strict';

  describe('modalConfirm', function () {

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

      beforeEach(inject(function(_modalConfirm_, _$uibModal_) {
        service = _modalConfirm_;
        $uibModal = _$uibModal_;
      }));

      it('should be registered', function() {
        expect(service).not.toEqual(null);
      });

      it('should have confirm function', function() {
        expect(service.confirm).toEqual(jasmine.any(Function));
      });

      it('should have confirm function', function() {
        var fakeOpen = function(settings) {
          expect(settings.resolve.data).toEqual(labels);
          return {result: true}
        };
        spyOn($uibModal, 'open').and.callFake(fakeOpen); //.andReturn(true);
        var result = service.confirm(labels);
        expect(result).toBe(true);
        expect($uibModal.open).toHaveBeenCalled();
      });

    });

    describe('controller', function () {
      var $controller;

      beforeEach(inject(function (_$controller_) {
        $controller = _$controller_;
      }));
      
      it('should have values', function () {
       var vm = $controller('ModalConfirmController', {
          data: labels,
          $uibModalInstance: null
        });

        expect(vm).not.toEqual(null);
        expect(vm.data).toEqual(jasmine.any(Object));
        expect(vm.data).toEqual(labels);
        expect(vm.ok).toEqual(jasmine.any(Function));
        expect(vm.cancel).toEqual(jasmine.any(Function));
      })
    })

  })

})();
