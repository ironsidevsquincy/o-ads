/* jshint globalstrict: true, browser: true */
/* globals QUnit: false */
"use strict";

var version = require('../../src/js/version');

QUnit.module('Version tests');

QUnit.test('should return a tokenised string', function (assert) {
	assert.equal(version.toString(), ' version: ${project.version} Build life id: ${buildLifeId} Build date: ${buildLifeDate} git revision: ${buildNumber}', 'contains correct tokens');
});
