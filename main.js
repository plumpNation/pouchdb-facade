var DB = (function () {
    var remoteCouch = false,
        pouchdb,

        _name,

        createDB = function (name) {
            _name = name;
            pouchdb = new PouchDB(name);
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
                callback
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
        var notes = $scope.notes = [];

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

window.addEventListener('load', init, false);
