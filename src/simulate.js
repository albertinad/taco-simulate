// Copyright (c) Microsoft Corporation. All rights reserved.

var cordovaServe = require('cordova-serve'),
    path = require('path'),
    simulateServer = require('taco-simulate-server');

module.exports = function (opts) {
    require('./server/server').attach(simulateServer.app);

    var target = opts.target || 'chrome';
    var simHostUrl;

    simulateServer(opts, {
        simHostRoot: path.join(__dirname, 'sim-host'),
        node_modules:  path.resolve(__dirname, '..', 'node_modules')
    }).then(function (urls) {
        simHostUrl = urls.simHostUrl;
        return cordovaServe.launchBrowser({target: target, url: urls.appUrl});
    }).then(function () {
        return cordovaServe.launchBrowser({target: target, url: simHostUrl});
    });
};