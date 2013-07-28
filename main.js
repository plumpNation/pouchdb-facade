var NotesController = function ($scope) {

        // @todo http://jsfiddle.net/zrrrzzt/cNVhE/
        var notes = $scope.notes = [],

            onDbError = function (err) {
                console.error(err);
            },

            onDbGetAll = function (result) {
                $scope.loadNotes(result.rows);
            }

            onDbCreated = function (db) {
                dbHelper.getAll().then(onDbGetAll, onDbError);
            },

            onDbGet = function (doc) {
                $scope.$apply(function () {
                    $scope.notes.push(doc);
                });
            },

            // I would love to use angularjs $q, however it sucks
            // so I'm using q.js instead.
            dbHelper = new DB(window.PouchDB, Q);

        dbHelper.createDB('notes').then(onDbCreated, onDbError);

        $scope.loadNotes = function (notes) {
            var i;

            for (i = 0; i < (notes.length - 1); i += 1) {
                var note = notes[i];
                dbHelper.get(note.id).then(onDbGet, onDbError);
            };
        };


        $scope.addNote = function () {
            var newNote = $scope.newNote.trim(),
                noteData = {
                    _id: new Date().toISOString(),
                    body: newNote
                };

            notes.push(noteData);

            dbHelper.put(noteData);
        };

        $scope.removeNote = function (note) {
            notes.splice(notes.indexOf(note), 1);
            dbHelper.remove(note);
        };
    };
