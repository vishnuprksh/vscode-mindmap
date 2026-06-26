angular.module('kityminderEditor').provider('config', function() {
  this.config = {
    // Minimum right panel width.
    ctrlPanelMin: 250,

    // Right panel width.
    ctrlPanelWidth: 250,

    // Divider width.
    dividerWidth: 3,

    // Default language.
    defaultLang: 'en',

    // Zoom ratio.
    zoom: [10, 20, 30, 50, 80, 100, 120, 150, 200],

    // Image upload endpoint.
    imageUpload: 'server/imageUpload.php',
  };

  this.set = function(key, value) {
    var supported = Object.keys(this.config);
    var configObj = {};

    // Support full configuration.
    if (typeof key === 'object') {
      configObj = key;
    } else {
      configObj[key] = value;
    }

    for (var i in configObj) {
      if (configObj.hasOwnProperty(i) && supported.indexOf(i) !== -1) {
        this.config[i] = configObj[i];
      } else {
        console.error(
          'Unsupported config key: ',
          key,
          ', please choose in :',
          supported.join(', ')
        );
        return false;
      }
    }

    return true;
  };

  this.$get = function() {
    var me = this;

    return {
      get: function(key) {
        if (arguments.length === 0) {
          return me.config;
        }

        if (me.config.hasOwnProperty(key)) {
          return me.config[key];
        }

        console.warn('Missing config key pair for : ', key);
        return '';
      },
    };
  };
});
