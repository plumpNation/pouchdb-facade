var DB = (function () {
    var remoteCouch = false,
        pouchdb,

        _name,

        createDB = function (name) {
            _name = name;
            pouchdb = new PouchDB(name);
            return pouchdb;
        },

        _dbCallback = function (error, result) {
            if (!error) {
                console.info('Successfully posted a todo!');

            } else {
                console.error(error);
            }
        },

        put = function (data) {
            pouchdb.put(data, _dbCallback);
        },

        remove = function (data) {
            pouchdb.remove(data, _dbCallback);
        },

        get = function (id) {
            pouchdb.get(id, function (err, doc) {
                console.log(doc);
            });
        },

        _consoleDocs = function (err, doc) {
            console.log(err || doc);
        },

        /**
         * callback function must have (err, doc) as params
         *
         * @param  {Function} callback
         * @return {void}
         */
        info = function (callback) {
            pouchdb.allDocs(
                {
                    include_docs: true,
                    descending: true
                },
                callback || _consoleDocs
            );
        };

    return {
        'createDB': createDB,
        'info'    : info,
        'put'     : put,
        'remove'  : remove
    };

}());

// Angular stuff
var NotesController = function ($scope) {

        // @todo http://jsfiddle.net/zrrrzzt/cNVhE/
        var notes = $scope.notes = [];

        $scope.pouchdb = new Pouch('notes', function (err, db) {

            if (err) {
                console.log(err);

            } else {
                db.allDocs(function (err, result) {
                    if (err) {
                        console.log(err);

                    } else {
                        $scope.loadNotes(result.rows);
                    }
                });
            }
        });

        $scope.loadNotes = function (notes) {
            var i;

            for (i = 0; i < (notes.length - 1); i += 1) {
                var note = notes[i];

                $scope.pouchdb.get(
                    note.id,
                    function (err, doc) {
                        if (err) {
                            console.log(err);

                        } else {
                            $scope.$apply(function() {
                                $scope.notes.push(doc);
                            });
                        }
                    }
                );
            };
        };


        $scope.addNote = function () {
            var newNote = $scope.newNote.trim(),
                noteData = {
                    _id: new Date().toISOString(),
                    body: newNote
                };

            notes.push(noteData);

            DB.put(noteData);
        };

        $scope.removeNote = function (note) {
            notes.splice(notes.indexOf(note), 1);
            DB.remove(note);
        };
    },

    init = function () {
        DB.createDB('notes');
    };

init();
