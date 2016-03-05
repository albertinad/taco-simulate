// Copyright (c) Microsoft Corporation. All rights reserved.

var cordovaServe = require('cordova-serve'),
    path = require('path'),
    simulateServer = require('taco-simulate-server');

module.exports = function (opts) {
    var target = opts.target || 'chrome';
    var simHostUrl;

    return simulateServer(opts, {
        simHostRoot: path.join(__dirname, 'sim-host'),
        node_modules:  path.resolve(__dirname, '..', 'node_modules')
    }).then(function (urls) {
        require('./server/server').attach(simulateServer.app);

        simHostUrl = urls.simHostUrl;
        return cordovaServe.launchBrowser({target: target, url: urls.appUrl});
    }).then(function () {
        return cordovaServe.launchBrowser({target: target, url: simHostUrl});
    }).catch(function (error) {
        // Ensure server is closed, then rethrow so it can be handled by downstream consumers.
        simulateServer.server && simulateServer.server.close();
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error(error);
        }
    });
};

module.exports.stopServer = function () {
  return simulateServer.stopServer();
};
