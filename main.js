/**
 * @example
 * var db = new DB(window.PouchDB, Q);
 *
 * @param  {PouchDB}    DB https://github.com/daleharvey/pouchdb
 * @param  {Q} q        https://github.com/kriskowal/q
 * @return {DB}
 */
var DB = function (DB, q) {
    var remoteCouch = false,
        pouchdb,

        _name,

        _dbCallback = function (str, deferred) {
            return function (error, response) {
                if (error) {
                    if (deferred) {
                        deferred.reject(error);
                        return;
                    }
                    console.error(error);
                    return;
                }

                console.info(str);

                if (deferred) {
                    deferred.resolve(response);
                }
            }
        },

        /**
         * Creates your db for you. How nice.
         *
         * @param  {String} name The name you wish your db to use.
         * @return {promise}
         */
        createDB = function (name) {
            var deferred = q.defer();

            _name = name;

            pouchdb = new DB(
                name,
                _dbCallback('Created db: ' + name, deferred)
            );

            return deferred.promise;
        },

        put = function (data) {
            var deferred = q.defer();
            pouchdb.put(data, _dbCallback('Put data', deferred));
            return deferred.promise;
        },

        remove = function (data) {
            var deferred = q.defer();
            pouchdb.remove(data, _dbCallback('Removed data', deferred));
            return deferred.promise;
        },

        get = function (id) {
            var deferred = q.defer();

            pouchdb.get(id, _dbCallback('Got data: ' + id , deferred));

            return deferred.promise;
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
        getAll = function () {
            var deferred = q.defer();

            pouchdb.allDocs(
                {
                    include_docs: true,
                    descending: true
                },
                _dbCallback('Got all', deferred)
            );

            return deferred.promise;
        };

    return {
        'createDB': createDB,
        'getAll'  : getAll,
        'get'     : get,
        'put'     : put,
        'remove'  : remove
    };
};

// Angular stuff
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
