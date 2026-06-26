angular.module('kityminderEditor').filter('lang', [
  'config',
  'lang.en',
  function(config, lang) {
    return function(text, block) {
      var defaultLang = config.get('defaultLang');

      if (lang[defaultLang] == undefined) {
        return 'Language pack not found. Please check lang.xxx.service.js.';
      } else {
        var dict = lang[defaultLang];
        block.split('/').forEach(function(ele, idx) {
          dict = dict[ele];
        });

        return dict[text] || null;
      }
    };
  },
]);
