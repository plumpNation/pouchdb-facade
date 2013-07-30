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
        _db,
        _name,

        getDbName = function () {
            return _name;
        },

        _dbCallback = function (description, deferred) {
            return function (error, response) {

                if (error) {
                    console.error(error);
                    if (deferred) {
                        deferred.reject(new Error(error.error + ':' + error.reason));
                    }
                    return;
                }

                console.info(description);

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

            _db = new DB(
                _name,
                _dbCallback('Created db: ' + name, deferred)
            );

            return deferred.promise;
        },

        put = function (data) {
            var deferred = q.defer();
            _db.put(data, _dbCallback('Put data', deferred));
            return deferred.promise;
        },

        remove = function (data) {
            var deferred = q.defer();
            _db.remove(data, _dbCallback('Removed data', deferred));
            return deferred.promise;
        },

        get = function (id) {
            var deferred = q.defer();

            _db.get(id, _dbCallback('Got data: ' + id , deferred));

            return deferred.promise;
        },

        _consoleDocs = function (err, doc) {
            console.log(err || doc);
        },

        onChange = function (callback) {
            var options = {
                continuous: true,
                // callback(change)
                onChange  : callback
            };

            _db.info(function (err, info) {
                options.since = info.update_seq;
                _db.changes(options);
            });
        },

        /**
         * callback function must have (err, doc) as params
         *
         * @param  {Function} callback
         * @return {void}
         */
        getAll = function () {
            var deferred = q.defer(),
                options = {
                    include_docs: true,
                    descending  : true
                };

            _db.allDocs(options, _dbCallback('Got all', deferred));

            return deferred.promise;
        };

    return {
        'onChange'      : onChange,
        'createDB'      : createDB,
        'getAll'        : getAll,
        'getDbName'     : getDbName,
        'get'           : get,
        'put'           : put,
        'remove'        : remove
    };
};
