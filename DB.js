/**
 * @example
 * var db = new DB(window.PouchDB, Q);
 *
 * @param  {PouchDB}    DB https://github.com/daleharvey/pouchdb
 * @param  {Q} Deferred        https://github.com/kriskowal/q
 * @param  {Object} options
 * @return {DB}
 */
var DB = function (DB, Deferred, _, remoteDbUrl) {

    var remoteCouch = false,
        _db,
        _rdb,

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
         * @return {Promise}
         */
        createDB = function (name) {
            var deferred = Deferred.defer(),
                rdeferred,
                localMessage = 'Created db: ' + name;

            _name = name;

            _db = new DB(
                name,
                function () {
                    var remoteDbMessage;

                    _dbCallback(localMessage, deferred)();

                    if (!!remoteDbUrl) {
                        rdeferred = Deferred.defer();

                        remoteDbMessage = 'Created remote db: ' + remoteDbUrl;

                        _rdb = new DB(
                            remoteDbUrl,
                            function () {
                                _dbCallback(remoteDbMessage, rdeferred)();
                                syncDbs();
                            }
                        );
                    }
                }
            );

            return deferred.promise;
        },

        put = function (data) {
            var deferred = Deferred.defer();
            _db.put(data, _dbCallback('Put data', deferred));
            return deferred.promise;
        },

        remove = function (data) {
            var deferred = Deferred.defer();
            _db.remove(data, _dbCallback('Removed data', deferred));
            return deferred.promise;
        },

        get = function (id) {
            var deferred = Deferred.defer();

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
         * options.filter    : Reference a filter function from a design document to selectively
         *                     get updates.
         *
         * options.complete  : Function called when all changes have been processed.
         * options.onChange  : Function called on each change processed.
         *
         * options.continuous: If true starts subscribing to future changes in the source database
         *                     and continue replicating them.
         *
         * @param {String} direction Can be 'to' or 'from'.
         * @param  {Object} options
         * @return {Promise}
         */
        updateRemote = function (direction, options) {
            var deferred,
                origOnComplete,
                validDirections = ['to', 'from'];

            if (!direction || !_(validDirections).indexOf(direction) === -1) {
                throw new Error('Direction must be specified');
            }

            options = options || {};

            deferred = Deferred.defer();

            console.log(!remoteDbUrl);

            if (!remoteDbUrl) {
                deferred.reject(new Error('No remote db specified'));

            } else {
                if (options.complete) {
                    origOnComplete = options.complete;
                }

                options.complete = function () {
                    if (origOnComplete) {
                        origOnComplete();
                    }

                    deferred.resolve();
                };

                _db.replicate[direction](remoteDbUrl, options);
            }

            return deferred.promise;
        },

        updateRemoteDb = function (options) {
            return updateRemote('to', options);
        },

        updateLocalDb = function (options) {
            return updateRemote('from', options);
        },

        syncDbs = function (options) {
            updateRemoteDb(options);
            updateLocalDb(options);
        },

        getAll = function () {
            var deferred = Deferred.defer(),
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
        'updateLocalDb' : updateLocalDb,
        'updateRemoteDb': updateRemoteDb,
        'getAll'        : getAll,
        'getDbName'     : getDbName,
        'get'           : get,
        'put'           : put,
        'remove'        : remove
    };
};
