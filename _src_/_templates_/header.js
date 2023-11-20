const ForgeAnalytics = new function () {

    const _this = this;

    function $Promise(key) {

        let resolver, rejector;

        const $promise = new Promise(function (resolve, reject) {

            resolver = resolve;
            rejector = reject;

        });

        return [$promise, { resolve: resolver, reject: rejector }];

    }

    const _operations = new function () {

        const _keyMap = new Map();
        const _$operationMap = new Map();

        this.Add = function (key) {

            const [$promise, handle] = $Promise();

            _keyMap.set(key, $promise);
            _$operationMap.set($promise, handle);

            return $promise;

        };

        this.Get = function (key) {

            return _keyMap.get(key);

        };

        this.Resolve = function ($operation, data) {

            const handle = _$operationMap.get($operation);
            handle.resolve(data);

        };

        this.Reject = function ($operation, err) {

            const handle = _$operationMap.get($operation);
            handle.reject(err);

        };

    };

    const _analytics = new function () {

        const _segments = new function () {

            const _pages = [];
            this.Current = function () {

                return _pages[_pages.length - 1];

            };
            this.Next = function (fileUrl) {

                _pages.push(fileUrl);

            };

        };

        this.Segments = function () {

            return _segments;

        };

    }

    function _construct() {

        const _this = this;
        _operations.Add("load")
            .then(function () {

                console.log("PROGRAM LOADING SUCCESSFULLY");

            })
            .catch(async function () {

                const currentSegment = _analytics.Segments().Current();

                const fs = require("fs");

                /* const response = fs.readdirSync("")
                    .then(function () {
                        console.log("fetch good");
                    })
                    .catch(function (err) {
                        console.log("fetch bad", err);
                    }) */

                // const meta = response; //  JSON.parse(fs.readFileSync(__filename));

                console.log("PROGRAM LOADING FAILED @", currentSegment);
            })
            .finally(function () {

                // process.exit();

            });


        try {

            process.on('uncaughtException', _uncaughtException);

        } catch (err) {


        }
        

    }

    function _uncaughtException(err, origin) {

        console.log(err);

        const $operation = _operations.Get("load");
        _operations.Reject($operation, err);

    }

    _this.Operations = function (key) {

        return (key === undefined) ? _operations : _operations.Get(key);

    };

    this.Analytics = function () {

        return _analytics;

    };

    _construct();

}