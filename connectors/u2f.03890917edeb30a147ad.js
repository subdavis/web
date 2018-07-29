/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/connectors/u2f.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/connectors/u2f.js":
/*!*******************************!*\
  !*** ./src/connectors/u2f.js ***!
  \*******************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var u2f__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! u2f */ "u2f");
/* harmony import */ var u2f__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(u2f__WEBPACK_IMPORTED_MODULE_0__);
﻿

document.addEventListener('DOMContentLoaded', function (event) {
    init();
});

var parentUrl = null,
    parentOrigin = null,
    version = null,
    stop = false,
    sentSuccess = false;

function init() {
    start();
    onMessage();
    info('ready');
}

function start() {
    sentSuccess = false;

    if (!u2f__WEBPACK_IMPORTED_MODULE_0__["isSupported"]) {
        error('U2F is not supported in this browser.');
        return;
    }

    var data = getQsParam('data');
    if (!data) {
        error('No data.');
        return;
    }

    parentUrl = getQsParam('parent');
    if (!parentUrl) {
        error('No parent.');
        return;
    }
    else {
        var link = document.createElement('a');
        link.href = parentUrl;
        parentOrigin = link.origin;
    }

    var versionQs = getQsParam('v');
    if (!versionQs) {
        error('No version.');
        return;
    }

    try {
        version = parseInt(versionQs);
        var jsonString = b64Decode(data);
        var json = JSON.parse(jsonString);
    }
    catch (e) {
        error('Cannot parse data.');
        return;
    }

    if (!json.appId || !json.challenge || !json.keys || !json.keys.length) {
        error('Invalid data parameters.');
        return;
    }

    stop = false
    initU2f(json);
}

function initU2f(obj) {
    if (stop) {
        return;
    }

    u2f__WEBPACK_IMPORTED_MODULE_0__["sign"](obj.appId, obj.challenge, obj.keys, function (data) {
        if (data.errorCode) {
            if (data.errorCode !== 5) {
                error('U2F Error: ' + data.errorCode);
                setTimeout(function () {
                    initU2f(obj);
                }, 1000)
            }
            else {
                initU2f(obj);
            }

            return;
        }

        success(data);
    }, 10);
}

function onMessage() {
    window.addEventListener('message', function (event) {
        if (!event.origin || event.origin === '' || event.origin !== parentOrigin) {
            return;
        }

        if (event.data === 'stop') {
            stop = true;
        }
        else if (event.data === 'start' && stop) {
            start();
        }
    }, false);
}

function error(message) {
    parent.postMessage('error|' + message, parentUrl);
}

function success(data) {
    if (sentSuccess) {
        return;
    }

    var dataString = JSON.stringify(data);
    parent.postMessage('success|' + dataString, parentUrl);
    sentSuccess = true;
}

function info(message) {
    parent.postMessage('info|' + message, parentUrl);
}

function getQsParam(name) {
    var url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function b64Decode(str) {
    return decodeURIComponent(Array.prototype.map.call(atob(str), function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}


/***/ }),

/***/ "u2f":
/*!**********************!*\
  !*** external "u2f" ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = u2f;

/***/ })

/******/ });
//# sourceMappingURL=u2f.03890917edeb30a147ad.js.map