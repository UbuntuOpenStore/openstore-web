var types = function() {
	return {
		restrict: 'E',
		replace: false,
		scope: {
			model: '=ngModel'
		},
		templateUrl: '/app/partials/types.html',
		link: function($scope) {
			$scope.types = {
				app: 'App',
				scope: 'Scope',
				webapp: 'Web App',
				'webapp+': 'Web App+',
				snappy: 'Snappy App',
			};
		}
	};
};

module.exports = types;
