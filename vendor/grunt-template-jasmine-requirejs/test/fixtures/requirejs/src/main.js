require.config({
  config: {
    math: {
      description: "Math module"
    },
    sum: {
      description: "Sum module"
    },
    serializer: {
      regexp: /foo/,
      fn: function () {}
    }
  },
  shim: {
    nonRequireJsLib: {
      init: function () {
        return this.nonRequireJsLib.noConflict();
      }
    },
    nonRequireJsLib2: {
      init: function () {
        return this.nonRequireJsLib2.noConflict();
      }
    }
  }
});

require(['app'], function(app) {
  app.start();
});
