angular.module('kityminderEditor')
    .directive('topTab', function() {
       return {
           restrict: 'A',
           templateUrl: 'ui/directive/topTab/topTab.html',
           scope: {
               minder: '=topTab',
               editor: '='
           },
           link: function(scope) {

               /*
               *
               * Selecting a new tab runs both setCurTab and foldTopTab.
               * Clicking the current tab runs only foldTopTop.
               *
               * setCurTab runs whenever a new tab is selected and also during initialization.
               * executedCurTab records whether setCurTab has already run.
               * isInit records whether the directive is initializing and is set to false by either function.
               * isOpen records whether topTab is open.
               *
               * This requires three mutex flags.
               * */
               var executedCurTab = false;
               var isInit = true;
               var isOpen = true;

               scope.setCurTab = function(tabName) {
                   setTimeout(function() {
                       //console.log('set cur tab to : ' + tabName);
                       executedCurTab = true;
                       //isOpen = false;
                       if (tabName != 'idea') {
                           isInit = false;
                       }
                   });
                };

               scope.toggleTopTab = function() {
                   setTimeout(function() {
                       if(!executedCurTab || isInit) {
                           isInit = false;

                           isOpen ? closeTopTab(): openTopTab();
                           isOpen = !isOpen;
                       }

                       executedCurTab = false;
                   });
               };

               function closeTopTab() {
                   var $tabContent = $('.tab-content');
                   var $minderEditor = $('.minder-editor');

                   $tabContent.animate({
                       height: 0,
                       display: 'none'
                   });

                   $minderEditor.animate({
                      top: '32px'
                   });
               }

               function openTopTab() {
                   var $tabContent = $('.tab-content');
                   var $minderEditor = $('.minder-editor');

                   $tabContent.animate({
                       height: '60px',
                       display: 'block'
                   });

                   $minderEditor.animate({
                       top: '92px'
                   });
               }
           }
       }
    });
