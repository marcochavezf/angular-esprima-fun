/**
 * Created by marcochavezf on 2/13/17.
 */
var app = angular.module('noteApp', []);

app.directive('notepad', function(notesFactory) {

  var link = {
      pre: function($scope, elem, attrs) {
        $scope.propertyA = 'propertyA';
      },
      post: function(scope, elem, attrs) {
        scope.openEditor = function (index) {
          scope.editMode = true;
          if (index !== undefined) {
            scope.noteText = notesFactory.get(index).content;
            scope.index = index;
          } else
            scope.noteText = undefined;
        };
        scope.save = function () {
          if (scope.noteText !== "" && scope.noteText !== undefined) {
            var note = {};
            note.title = scope.noteText.length > 10 ? scope.noteText.substring(0, 10) + '. . .' : scope.noteText;
            note.content = scope.noteText;
            note.id = scope.index != -1 ? scope.index : localStorage.length;
            scope.notes = notesFactory.put(note);
          }
          scope.restore();
        };


        scope.restore = function () {
          scope.editMode = false;
          scope.index = -1;
          scope.noteText = "";
        };

        var editor = elem.find('#editor');

        scope.restore();

        scope.notes = notesFactory.getAll();

        editor.bind('keyup keydown', function () {
          scope.noteText = editor.text().trim();
        });

      }
    };

  return {
    restrict: 'AE',
    scope: {},
    link: link,
    templateUrl: 'templateurl.html'
  };
});
