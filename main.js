var db = new PouchDB('nuffsed'),
    remoteCouch = false;

function NotesController ($scope) {
    var notes = $scope.notes = [{
        body: "Foobar gazonk"
    }];

    $scope.addNote = function () {
        var newNote = $scope.newNote.trim();
        notes.push({body: newNote});
    };

    $scope.removeNote = function (note) {
        notes.splice(notes.indexOf(note), 1);
    };
};
