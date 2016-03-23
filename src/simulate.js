// Copyright (c) Microsoft Corporation. All rights reserved.

var cordovaServe = require('cordova-serve'),
    path = require('path'),
    SimulateServer = require('taco-simulate-server');

/**
 * @constructor
 */
function Simulate(opts) {
    this._simulateServer = null;
    this._target = null;
    this._opts = opts;
}

Object.defineProperties(Simulate.prototype, {
    'simulateServer': {
        get: function () {
            return this._simulateServer;
        }
    }
});

Simulate.prototype.start = function () {
    this._target = this._opts.target || 'chrome';

    this._simulateServer = new SimulateServer(this._opts, {
        simHostRoot: path.join(__dirname, 'sim-host'),
        node_modules: path.resolve(__dirname, '..', 'node_modules')
    });

    return this._simulateServer.start().then(function () {
        var simHostRoot = this._simulateServer.dirs.hostRoot['sim-host'];

        require('./server/server').attach(this._simulateServer.app, simHostRoot);

        return this.launchBrowsers();
    }.bind(this));
};

Simulate.prototype.launchBrowsers = function () {
    var appUrl = this._simulateServer.appUrl,
        simHostUrl = this._simulateServer.simHostUrl,
        target = this._target;

    return cordovaServe.launchBrowser({
        target: target,
        url: appUrl
    }).then(function () {
        return cordovaServe.launchBrowser({
            target: target,
            url: simHostUrl
        });
    }).catch(function (error) {
        // Ensure server is closed, then rethrow so it can be handled by downstream consumers.
        this.stopServer();
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error(error);
        }
    });
};

Simulate.prototype.stopServer = function () {
    this._simulateServer.stop();
};

module.exports = function (opts) {
    return new Simulate(opts);
};
