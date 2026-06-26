angular.module('kityminderEditor')
	.directive('themeList', function() {
		return {
			restrict: 'E',
			templateUrl: 'ui/directive/themeList/themeList.html',
            replace: true,
			link: function($scope) {
				var themeList = kityminder.Minder.getThemeList();

				//$scope.themeList = themeList;

				$scope.getThemeThumbStyle = function (theme) {
					var themeObj = themeList[theme];
                    if (!themeObj) {
                        return;
                    }
					var style = {
						'color': themeObj['root-color'],
						'border-radius': themeObj['root-radius'] / 2
					};

					if (themeObj['root-background']) {
						style['background'] = themeObj['root-background'].toString();
					}

					return style;
				};

				// Maintain the theme key list for a nicer order instead of sorting alphabetically.
				$scope.themeKeyList = [
					'classic',
					'classic-compact',
					'fresh-blue',
					'fresh-blue-compat',
					'fresh-green',
					'fresh-green-compat',
					'fresh-pink',
					'fresh-pink-compat',
					'fresh-purple',
					'fresh-purple-compat',
					'fresh-red',
					'fresh-red-compat',
					'fresh-soil',
					'fresh-soil-compat',
					'snow',
					'snow-compact',
					'tianpan',
					'tianpan-compact',
					'fish',
					'wire'
				];
			}
		}
	});
