angular.module('kityminderEditor').service('lang.zh-cn', [
  'lang.en',
  function(lang) {
    return {
      'zh-cn': lang.en,
    };
  },
]);
