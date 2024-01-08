define(function (require) {
  describe('Setup', function () {
    it('should not invoke the require call in main.js (which will invoke "app.start()")', function () {
      expect(require('app').isStarted()).toBe(false);
    });

    it('should configure a description for math', function () {
      expect(require('math').getDescription()).toEqual('Math module (overridden)');
    });

    it('should configure an overidden description for sum', function () {
      expect(require('sum').getDescription()).toEqual('Sum module (overridden)');
    });

    it('should init methods in shim config', function () {
      expect(require('nonRequireJsLib')).toBeDefined();
      expect(require('nonRequireJsLib2')).toBeDefined();
      expect(window.nonRequireJsLib).toBeUndefined();
      expect(window.nonRequireJsLib2).toBeUndefined();
    });

    it('should not try to serialize unserializable objects', function () {
      var config = require('serializer').config;
      expect(config.regexp instanceof RegExp).toBe(true);
      expect(config.fn instanceof Function).toBe(true);
    })
  });
});
