angular.module('kityminderEditor').directive('fontOperator', function() {
  return {
    restrict: 'E',
    templateUrl: 'ui/directive/fontOperator/fontOperator.html',
    scope: {
      minder: '=',
    },
    replace: true,
    link: function(scope) {
      var minder = scope.minder;
      var currentTheme = minder.getThemeItems();

      scope.fontSizeList = [10, 12, 16, 18, 24, 32, 48];
      scope.fontFamilyList = [
        {
          name: 'SimSun',
          val: 'SimSun',
        },
        {
          name: 'Microsoft YaHei',
          val: 'Microsoft YaHei',
        },
        {
          name: 'SimKai',
          val: 'SimKai',
        },
        {
          name: 'SimHei',
          val: 'SimHei',
        },
        {
          name: 'SimLi',
          val: 'SimLi',
        },
        {
          name: 'Andale Mono',
          val: 'andale mono',
        },
        {
          name: 'Arial',
          val: 'arial,helvetica,sans-serif',
        },
        {
          name: 'arialBlack',
          val: 'arial black,avant garde',
        },
        {
          name: 'Comic Sans Ms',
          val: 'comic sans ms',
        },
        {
          name: 'Impact',
          val: 'impact,chicago',
        },
        {
          name: 'Times New Roman',
          val: 'times new roman',
        },
        {
          name: 'Sans-Serif',
          val: 'sans-serif',
        },
      ];

      scope.$on('colorPicked', function(event, color) {
        event.stopPropagation();

        scope.foreColor = color;
        minder.execCommand('forecolor', color);
      });

      scope.setDefaultColor = function() {
        var currentNode = minder.getSelectedNode();
        var fontColor = minder.getNodeStyle(currentNode, 'color');

        // It may be a kity color object.
        return typeof fontColor === 'object' ? fontColor.toHEX() : fontColor;
      };

      scope.foreColor = scope.setDefaultColor() || '#000';

      scope.getFontfamilyName = function(val) {
        var fontName = '';
        scope.fontFamilyList.forEach(function(ele, idx, arr) {
          if (ele.val === val) {
            fontName = ele.name;
            return '';
          }
        });

        return fontName;
      };
    },
  };
});
