var commonModule = angular.module('odin.common');

// -----
//  CardListController
// -----
commonModule.controller('CardListController', [ '$scope',
  function CardListController($scope) {
    var cards = this.cards = $scope.cards = [];
    var destroyed = false;
    
    $scope.selectedCard = null;
    
    // -----
    //  Controller Functions
    // -----
    
    // addCard()    
    this.addCard = function addCard(card) {
      cards.push(card);
    }; //- addCard()
    
    // removeCard()    
    this.removeCard = function removeCard(card) {
      cards = _.reject(cards, function(item) {
        return item.$id === card.$id;
      });
    }; //- removeCard()
    
    // -----
    //  Handlers
    // -----
    
    $scope.$on('$destroy', function() {
      destroyed = true;
    });
  }
]);

// -----
//  cardList Directive
// -----
commonModule.directive('cardList', [ '$parse',
  function cardList($parse) {
    return {
      restrict: 'EA',
      replace: true,
      transclude: true,
      controller: 'CardListController',
      templateUrl: '/templates/common/cardList.htm'
    };
  }
]);

// -----
//  card Directive
// -----
commonModule.directive('card', function card() {
  return {
    restrict: 'EA',
    replace: true,
    transclude: true,
    require: '^cardList',
    scope: {
      title: '=',
      updated: '=',
      item: '=',
      version: '='
    },
    compile: function compileCard(elem, attrs, transclude) {
      return function postLink(scope, elem, attrs, cardListController) {
        // -----
        //  Handlers
        // -----
        cardListController.addCard(scope);
        scope.$on('$destroy', function() {
          cardListController.removeCard(scope);
        });
      };
    },
    templateUrl: '/templates/common/card.htm'
  };
});
