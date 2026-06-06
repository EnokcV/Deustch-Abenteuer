// Empty stub for jsdom. Tests use the 'node' environment in vitest.
// This stub exists only to avoid pulling in whatwg-encoding@3.1.1
// which is deprecated and emits a warning during npm install.
module.exports = {};
module.exports.default = {};
module.exports.JSDOM = class { constructor() {} };
module.exports.CookieJar = class {};
module.exports.ResourceLoader = class {};
module.exports.VirtualConsole = class {};
