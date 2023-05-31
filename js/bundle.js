(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
module.exports={
  "OPENAI_API_KEY": "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"
}

},{}],3:[function(require,module,exports){
const { Configuration, OpenAIApi } = require("openai");
const lngDetector = new (require("languagedetect"))();
const config = require("./config.json");

const configuration = new Configuration({
  apiKey: config.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const EN = "english";
const DE = "german";
const supportedLanguages = [EN, DE];

const getPrompt = (lng, history, subject, recipient, content) => {
  if (lng == EN)
    return `Include references to the prior email exchange: 
---
${history}
---
Compose an email for me to ${recipient} about ${subject}. The email should cover these points: 
---
${content}
---
Refer back to our earlier conversations, and follow the recipient's style observed in our past discussions.`;

  if (lng == DE)
    return `Beziehen Sie sich auf den vorherigen E-Mail-Austausch: 
---
${history}
---
Verfassen Sie für mich eine E-Mail an ${recipient} über ${subject}. Die E-Mail sollte diese Punkte abdecken:
---
${content}
---
Beziehen Sie sich auf unsere früheren Unterhaltungen und folgen Sie dem Stil des Empfängers, wie er in unseren vorherigen Diskussionen beobachtet wurde.`;

  throw new Error("Language not supported.");
};

const getSystemPrompt = (lng, recipient, subject) => {
  if (lng == EN)
    return `You're an AI trained to draft professional emails. The user requires your assistance in writing an email to ${recipient} with a purpose: ${subject}.`;

  if (lng == DE)
    return `Sie sind eine KI, die darauf trainiert ist, professionelle E-Mails zu entwerfen. Der Benutzer benötigt Ihre Unterstützung beim Verfassen einer E-Mail an ${recipient} mit dem Zweck: ${subject}.`;

  throw new Error("Language not supported.");
};

const getLanguage = (request) => {
  const languages = lngDetector.detect(request);

  for (const [lng, probability] of languages) {
    if (supportedLanguages.includes(lng)) {
      return lng;
    }
  }

  throw new Error("Language not supported.");
};

const buildPrompt = (history, subject, recipient, content) => {
  const lng = getLanguage(history + content);

  return [
    {
      role: "system",
      content: getSystemPrompt(lng, recipient, subject),
    },
    {
      role: "user",
      content: getPrompt(lng, history, subject, recipient, content),
    },
  ];
};

async function* streamAsyncIterator(stream) {
  // Get a lock on the stream
  const reader = stream.getReader();

  try {
    while (true) {
      // Read from the stream
      const { done, value } = await reader.read();
      // Exit if we're done
      if (done) return;
      // Else yield the chunk
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}

const buildEmail = async (
  history,
  subject,
  recipient,
  content,
  elementToSet,
  then
) => {
  const url = "https://api.openai.com/v1/chat/completions";

  // Make a POST request to the OpenAI API to get chat completions
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: buildPrompt(history, subject, recipient, content),
      temperature: 0.5,
      max_tokens: 2048,
      frequency_penalty: 0,
      presence_penalty: 0,
      stream: true,
    }),
  });
  elementToSet.innerHTML = "";

  // Create a TextDecoder to decode the response body stream
  const decoder = new TextDecoder();

  // Iterate through the chunks in the response body using for-await...of
  for await (const chunk of streamAsyncIterator(response.body)) {
    const decodedChunk = decoder.decode(chunk);

    // Clean up the data
    const lines = decodedChunk
      .split("\n")
      .map((line) => line.replace("data: ", ""))
      .filter((line) => line.length > 0)
      .filter((line) => line !== "[DONE]")
      .map((line) => JSON.parse(line));

    // Destructuring!
    for (const line of lines) {
      const {
        choices: [
          {
            delta: { content },
          },
        ],
      } = line;

      if (content) {
        elementToSet.innerHTML += content.replaceAll("\n", "<br>");
      }
    }
  }
};

function getElementByXpath(path) {
  return document.evaluate(
    path,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;
}

function createCommitButton() {
  const commitButton = document.createElement("button");

  commitButton.innerText = "Gen Mail";
  commitButton.style.backgroundColor = "#00bcd4";
  commitButton.style.color = "#fff";
  commitButton.style.border = "none";
  commitButton.style.borderRadius = "5px";
  commitButton.style.padding = "10px";
  commitButton.style.margin = "10px";
  commitButton.style.fontSize = "16px";
  commitButton.style.zIndex = "9999";
  commitButton.style.borderRadius = "5px";
  commitButton.style.textAlign = "center";
  commitButton.style.fontFamily = "Roboto, sans-serif";

  return commitButton;
}

function makeHTMLToText(html) {
  return html
    .replaceAll("<br>", "\n")
    .replaceAll("<br/>", "\n")
    .replaceAll("<div>", "\n")
    .replaceAll("</div>", "")
    .replaceAll(/<[^>]*>?/gm, "");
}

function logic() {
  const sendButton = getElementByXpath("//div[text() = 'Send']");

  if (sendButton) {
    const toolBar = sendButton.parentNode.parentNode.parentNode.parentNode;

    // if the button already exists, return
    if (
      getElementByXpath("//button[text() = 'Gen Mail']") ||
      getElementByXpath("//button[text() = 'Generating...']")
    )
      return;

    console.log("Adding button...");
    const commitButton = createCommitButton();

    commitButton.addEventListener("click", async () => {
      if (commitButton.innerText == "Generating...") return;
      commitButton.innerText = "Generating...";

      const inputField = getElementByXpath("//div[@aria-label='Message Body']");
      const subjectElement = getElementByXpath("//input[@name='subjectbox']");
      const subject = subjectElement.value;
      const recipientElement =
        subjectElement.parentElement.parentElement.children[1];
      const recipient =
        recipientElement.textContent.split(">To")[1]?.split("CcBcc")[0] ??
        recipientElement.textContent;

      const content = makeHTMLToText(inputField.innerHTML);

      const historyElement = getElementByXpath(
        "//div[@style='word-wrap:break-word;line-break:after-white-space']"
      ); // TODO: issue, if a chat is in the background, this will be the chat history
      const history = makeHTMLToText(historyElement?.innerHTML ?? "");

      console.log({
        history,
        subject,
        recipient,
        content,
      });

      console.log("Generating email...");
      console.log(buildPrompt(history, subject, recipient, content));

      try {
        await buildEmail(
          history,
          subject,
          recipient,
          content,
          inputField,
          () => {
            commitButton.innerText = "Gen Mail";
          }
        );
      } catch (error) {
        console.log(error);
        alert(error);
      }
    });

    toolBar.appendChild(commitButton);
  }
}

setInterval(logic, 1000);

},{"./config.json":2,"languagedetect":37,"openai":45}],4:[function(require,module,exports){
module.exports = require('./lib/axios');
},{"./lib/axios":6}],5:[function(require,module,exports){
'use strict';

var utils = require('./../utils');
var settle = require('./../core/settle');
var cookies = require('./../helpers/cookies');
var buildURL = require('./../helpers/buildURL');
var buildFullPath = require('../core/buildFullPath');
var parseHeaders = require('./../helpers/parseHeaders');
var isURLSameOrigin = require('./../helpers/isURLSameOrigin');
var createError = require('../core/createError');
var transitionalDefaults = require('../defaults/transitional');
var Cancel = require('../cancel/Cancel');

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;
    var responseType = config.responseType;
    var onCanceled;
    function done() {
      if (config.cancelToken) {
        config.cancelToken.unsubscribe(onCanceled);
      }

      if (config.signal) {
        config.signal.removeEventListener('abort', onCanceled);
      }
    }

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    function onloadend() {
      if (!request) {
        return;
      }
      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
        request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response);

      // Clean up request
      request = null;
    }

    if ('onloadend' in request) {
      // Use onloadend if available
      request.onloadend = onloadend;
    } else {
      // Listen for ready state to emulate onloadend
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }

        // The request errored out and we didn't get a response, this will be
        // handled by onerror instead
        // With one exception: request that using file: protocol, most browsers
        // will return status as 0 even though it's a successful request
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        }
        // readystate handler is calling before onerror or ontimeout handlers,
        // so we should call onloadend on the next 'tick'
        setTimeout(onloadend);
      };
    }

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
      var transitional = config.transitional || transitionalDefaults;
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(
        timeoutErrorMessage,
        config,
        transitional.clarifyTimeoutError ? 'ETIMEDOUT' : 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (responseType && responseType !== 'json') {
      request.responseType = config.responseType;
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken || config.signal) {
      // Handle cancellation
      // eslint-disable-next-line func-names
      onCanceled = function(cancel) {
        if (!request) {
          return;
        }
        reject(!cancel || (cancel && cancel.type) ? new Cancel('canceled') : cancel);
        request.abort();
        request = null;
      };

      config.cancelToken && config.cancelToken.subscribe(onCanceled);
      if (config.signal) {
        config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
      }
    }

    if (!requestData) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};

},{"../cancel/Cancel":7,"../core/buildFullPath":12,"../core/createError":13,"../defaults/transitional":20,"./../core/settle":17,"./../helpers/buildURL":23,"./../helpers/cookies":25,"./../helpers/isURLSameOrigin":28,"./../helpers/parseHeaders":30,"./../utils":33}],6:[function(require,module,exports){
'use strict';

var utils = require('./utils');
var bind = require('./helpers/bind');
var Axios = require('./core/Axios');
var mergeConfig = require('./core/mergeConfig');
var defaults = require('./defaults');

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  // Factory for creating new instances
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig(defaultConfig, instanceConfig));
  };

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Expose Cancel & CancelToken
axios.Cancel = require('./cancel/Cancel');
axios.CancelToken = require('./cancel/CancelToken');
axios.isCancel = require('./cancel/isCancel');
axios.VERSION = require('./env/data').version;

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = require('./helpers/spread');

// Expose isAxiosError
axios.isAxiosError = require('./helpers/isAxiosError');

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;

},{"./cancel/Cancel":7,"./cancel/CancelToken":8,"./cancel/isCancel":9,"./core/Axios":10,"./core/mergeConfig":16,"./defaults":19,"./env/data":21,"./helpers/bind":22,"./helpers/isAxiosError":27,"./helpers/spread":31,"./utils":33}],7:[function(require,module,exports){
'use strict';

/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;

},{}],8:[function(require,module,exports){
'use strict';

var Cancel = require('./Cancel');

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;

  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;

  // eslint-disable-next-line func-names
  this.promise.then(function(cancel) {
    if (!token._listeners) return;

    var i;
    var l = token._listeners.length;

    for (i = 0; i < l; i++) {
      token._listeners[i](cancel);
    }
    token._listeners = null;
  });

  // eslint-disable-next-line func-names
  this.promise.then = function(onfulfilled) {
    var _resolve;
    // eslint-disable-next-line func-names
    var promise = new Promise(function(resolve) {
      token.subscribe(resolve);
      _resolve = resolve;
    }).then(onfulfilled);

    promise.cancel = function reject() {
      token.unsubscribe(_resolve);
    };

    return promise;
  };

  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Subscribe to the cancel signal
 */

CancelToken.prototype.subscribe = function subscribe(listener) {
  if (this.reason) {
    listener(this.reason);
    return;
  }

  if (this._listeners) {
    this._listeners.push(listener);
  } else {
    this._listeners = [listener];
  }
};

/**
 * Unsubscribe from the cancel signal
 */

CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
  if (!this._listeners) {
    return;
  }
  var index = this._listeners.indexOf(listener);
  if (index !== -1) {
    this._listeners.splice(index, 1);
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;

},{"./Cancel":7}],9:[function(require,module,exports){
'use strict';

module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};

},{}],10:[function(require,module,exports){
'use strict';

var utils = require('./../utils');
var buildURL = require('../helpers/buildURL');
var InterceptorManager = require('./InterceptorManager');
var dispatchRequest = require('./dispatchRequest');
var mergeConfig = require('./mergeConfig');
var validator = require('../helpers/validator');

var validators = validator.validators;
/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(configOrUrl, config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof configOrUrl === 'string') {
    config = config || {};
    config.url = configOrUrl;
  } else {
    config = configOrUrl || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  var transitional = config.transitional;

  if (transitional !== undefined) {
    validator.assertOptions(transitional, {
      silentJSONParsing: validators.transitional(validators.boolean),
      forcedJSONParsing: validators.transitional(validators.boolean),
      clarifyTimeoutError: validators.transitional(validators.boolean)
    }, false);
  }

  // filter out skipped interceptors
  var requestInterceptorChain = [];
  var synchronousRequestInterceptors = true;
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
      return;
    }

    synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

    requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  var responseInterceptorChain = [];
  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
  });

  var promise;

  if (!synchronousRequestInterceptors) {
    var chain = [dispatchRequest, undefined];

    Array.prototype.unshift.apply(chain, requestInterceptorChain);
    chain = chain.concat(responseInterceptorChain);

    promise = Promise.resolve(config);
    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise;
  }


  var newConfig = config;
  while (requestInterceptorChain.length) {
    var onFulfilled = requestInterceptorChain.shift();
    var onRejected = requestInterceptorChain.shift();
    try {
      newConfig = onFulfilled(newConfig);
    } catch (error) {
      onRejected(error);
      break;
    }
  }

  try {
    promise = dispatchRequest(newConfig);
  } catch (error) {
    return Promise.reject(error);
  }

  while (responseInterceptorChain.length) {
    promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;

},{"../helpers/buildURL":23,"../helpers/validator":32,"./../utils":33,"./InterceptorManager":11,"./dispatchRequest":14,"./mergeConfig":16}],11:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected,
    synchronous: options ? options.synchronous : false,
    runWhen: options ? options.runWhen : null
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;

},{"./../utils":33}],12:[function(require,module,exports){
'use strict';

var isAbsoluteURL = require('../helpers/isAbsoluteURL');
var combineURLs = require('../helpers/combineURLs');

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};

},{"../helpers/combineURLs":24,"../helpers/isAbsoluteURL":26}],13:[function(require,module,exports){
'use strict';

var enhanceError = require('./enhanceError');

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};

},{"./enhanceError":15}],14:[function(require,module,exports){
'use strict';

var utils = require('./../utils');
var transformData = require('./transformData');
var isCancel = require('../cancel/isCancel');
var defaults = require('../defaults');
var Cancel = require('../cancel/Cancel');

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }

  if (config.signal && config.signal.aborted) {
    throw new Cancel('canceled');
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData.call(
    config,
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData.call(
      config,
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};

},{"../cancel/Cancel":7,"../cancel/isCancel":9,"../defaults":19,"./../utils":33,"./transformData":18}],15:[function(require,module,exports){
'use strict';

/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code,
      status: this.response && this.response.status ? this.response.status : null
    };
  };
  return error;
};

},{}],16:[function(require,module,exports){
'use strict';

var utils = require('../utils');

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  // eslint-disable-next-line consistent-return
  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function mergeDirectKeys(prop) {
    if (prop in config2) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  var mergeMap = {
    'url': valueFromConfig2,
    'method': valueFromConfig2,
    'data': valueFromConfig2,
    'baseURL': defaultToConfig2,
    'transformRequest': defaultToConfig2,
    'transformResponse': defaultToConfig2,
    'paramsSerializer': defaultToConfig2,
    'timeout': defaultToConfig2,
    'timeoutMessage': defaultToConfig2,
    'withCredentials': defaultToConfig2,
    'adapter': defaultToConfig2,
    'responseType': defaultToConfig2,
    'xsrfCookieName': defaultToConfig2,
    'xsrfHeaderName': defaultToConfig2,
    'onUploadProgress': defaultToConfig2,
    'onDownloadProgress': defaultToConfig2,
    'decompress': defaultToConfig2,
    'maxContentLength': defaultToConfig2,
    'maxBodyLength': defaultToConfig2,
    'transport': defaultToConfig2,
    'httpAgent': defaultToConfig2,
    'httpsAgent': defaultToConfig2,
    'cancelToken': defaultToConfig2,
    'socketPath': defaultToConfig2,
    'responseEncoding': defaultToConfig2,
    'validateStatus': mergeDirectKeys
  };

  utils.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
    var merge = mergeMap[prop] || mergeDeepProperties;
    var configValue = merge(prop);
    (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
  });

  return config;
};

},{"../utils":33}],17:[function(require,module,exports){
'use strict';

var createError = require('./createError');

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};

},{"./createError":13}],18:[function(require,module,exports){
'use strict';

var utils = require('./../utils');
var defaults = require('../defaults');

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  var context = this || defaults;
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn.call(context, data, headers);
  });

  return data;
};

},{"../defaults":19,"./../utils":33}],19:[function(require,module,exports){
(function (process){(function (){
'use strict';

var utils = require('../utils');
var normalizeHeaderName = require('../helpers/normalizeHeaderName');
var enhanceError = require('../core/enhanceError');
var transitionalDefaults = require('./transitional');

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = require('../adapters/xhr');
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = require('../adapters/http');
  }
  return adapter;
}

function stringifySafely(rawValue, parser, encoder) {
  if (utils.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils.trim(rawValue);
    } catch (e) {
      if (e.name !== 'SyntaxError') {
        throw e;
      }
    }
  }

  return (encoder || JSON.stringify)(rawValue);
}

var defaults = {

  transitional: transitionalDefaults,

  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');

    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data) || (headers && headers['Content-Type'] === 'application/json')) {
      setContentTypeIfUnset(headers, 'application/json');
      return stringifySafely(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    var transitional = this.transitional || defaults.transitional;
    var silentJSONParsing = transitional && transitional.silentJSONParsing;
    var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
    var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

    if (strictJSONParsing || (forcedJSONParsing && utils.isString(data) && data.length)) {
      try {
        return JSON.parse(data);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === 'SyntaxError') {
            throw enhanceError(e, this, 'E_JSON_PARSE');
          }
          throw e;
        }
      }
    }

    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },

  headers: {
    common: {
      'Accept': 'application/json, text/plain, */*'
    }
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;

}).call(this)}).call(this,require('_process'))
},{"../adapters/http":5,"../adapters/xhr":5,"../core/enhanceError":15,"../helpers/normalizeHeaderName":29,"../utils":33,"./transitional":20,"_process":1}],20:[function(require,module,exports){
'use strict';

module.exports = {
  silentJSONParsing: true,
  forcedJSONParsing: true,
  clarifyTimeoutError: false
};

},{}],21:[function(require,module,exports){
module.exports = {
  "version": "0.26.1"
};
},{}],22:[function(require,module,exports){
'use strict';

module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};

},{}],23:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};

},{"./../utils":33}],24:[function(require,module,exports){
'use strict';

/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};

},{}],25:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);

},{"./../utils":33}],26:[function(require,module,exports){
'use strict';

/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
};

},{}],27:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

/**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
module.exports = function isAxiosError(payload) {
  return utils.isObject(payload) && (payload.isAxiosError === true);
};

},{"./../utils":33}],28:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);

},{"./../utils":33}],29:[function(require,module,exports){
'use strict';

var utils = require('../utils');

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};

},{"../utils":33}],30:[function(require,module,exports){
'use strict';

var utils = require('./../utils');

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};

},{"./../utils":33}],31:[function(require,module,exports){
'use strict';

/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};

},{}],32:[function(require,module,exports){
'use strict';

var VERSION = require('../env/data').version;

var validators = {};

// eslint-disable-next-line func-names
['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
  validators[type] = function validator(thing) {
    return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
  };
});

var deprecatedWarnings = {};

/**
 * Transitional option validator
 * @param {function|boolean?} validator - set to false if the transitional option has been removed
 * @param {string?} version - deprecated version / removed since version
 * @param {string?} message - some message with additional info
 * @returns {function}
 */
validators.transitional = function transitional(validator, version, message) {
  function formatMessage(opt, desc) {
    return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
  }

  // eslint-disable-next-line func-names
  return function(value, opt, opts) {
    if (validator === false) {
      throw new Error(formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')));
    }

    if (version && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      // eslint-disable-next-line no-console
      console.warn(
        formatMessage(
          opt,
          ' has been deprecated since v' + version + ' and will be removed in the near future'
        )
      );
    }

    return validator ? validator(value, opt, opts) : true;
  };
};

/**
 * Assert object's properties type
 * @param {object} options
 * @param {object} schema
 * @param {boolean?} allowUnknown
 */

function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== 'object') {
    throw new TypeError('options must be an object');
  }
  var keys = Object.keys(options);
  var i = keys.length;
  while (i-- > 0) {
    var opt = keys[i];
    var validator = schema[opt];
    if (validator) {
      var value = options[opt];
      var result = value === undefined || validator(value, opt, options);
      if (result !== true) {
        throw new TypeError('option ' + opt + ' must be ' + result);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw Error('Unknown option ' + opt);
    }
  }
}

module.exports = {
  assertOptions: assertOptions,
  validators: validators
};

},{"../env/data":21}],33:[function(require,module,exports){
'use strict';

var bind = require('./helpers/bind');

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return Array.isArray(val);
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return toString.call(val) === '[object FormData]';
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (isArrayBuffer(val.buffer));
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (toString.call(val) !== '[object Object]') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return toString.call(val) === '[object URLSearchParams]';
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM
};

},{"./helpers/bind":22}],34:[function(require,module,exports){
/* eslint-env browser */
module.exports = typeof self == 'object' ? self.FormData : window.FormData;

},{}],35:[function(require,module,exports){
module.exports={"trigram":{"albanian":{"t\u00eb ":"0"," t\u00eb":"1","n\u00eb ":"2","p\u00ebr":"3"," p\u00eb":"4"," e ":"5","sht":"6"," n\u00eb":"7"," sh":"8","se ":"9","et ":"10","\u00eb s":"11","\u00eb t":"12"," se":"13","he ":"14","j\u00eb ":"15","\u00ebr ":"16","dhe":"17"," pa":"18","\u00eb n":"19","\u00eb p":"20"," q\u00eb":"21"," dh":"22","nj\u00eb":"23","\u00eb m":"24"," nj":"25","\u00ebsh":"26","in ":"27"," me":"28","q\u00eb ":"29"," po":"30","e n":"31","e t":"32","ish":"33","m\u00eb ":"34","s\u00eb ":"35","me ":"36","ht\u00eb":"37"," ka":"38"," si":"39","e k":"40","e p":"41"," i ":"42","an\u00eb":"43","ar ":"44"," nu":"45","und":"46","ve ":"47"," \u00ebs":"48","e s":"49"," m\u00eb":"50","nuk":"51","par":"52","uar":"53","uk ":"54","jo ":"55","r\u00eb ":"56","ta ":"57","\u00eb f":"58","en ":"59","it ":"60","min":"61","het":"62","n e":"63","ri ":"64","shq":"65","\u00eb d":"66"," do":"67"," nd":"68","sh ":"69","\u00ebn ":"70","at\u00eb":"71","hqi":"72","ist":"73","\u00eb q":"74"," gj":"75"," ng":"76"," th":"77","a n":"78","do ":"79","end":"80","imi":"81","ndi":"82","r t":"83","rat":"84","\u00eb b":"85","\u00ebri":"86"," mu":"87","art":"88","ash":"89","qip":"90"," ko":"91","e m":"92","edh":"93","eri":"94","je ":"95","ka ":"96","nga":"97","si ":"98","te ":"99","\u00eb k":"100","\u00ebsi":"101"," ma":"102"," ti":"103","eve":"104","hje":"105","ira":"106","mun":"107","on ":"108","po ":"109","re ":"110"," pr":"111","im ":"112","lit":"113","o t":"114","ur ":"115","\u00eb e":"116","\u00eb v":"117","\u00ebt ":"118"," ku":"119"," s\u00eb":"120","e d":"121","es ":"122","ga ":"123","iti":"124","jet":"125","nd\u00eb":"126","oli":"127","shi":"128","tje":"129"," b\u00eb":"130"," z ":"131","gje":"132","kan":"133","shk":"134","\u00ebnd":"135","\u00ebs ":"136"," de":"137"," kj":"138"," ru":"139"," vi":"140","ara":"141","gov":"142","kjo":"143","or ":"144","r p":"145","rto":"146","rug":"147","tet":"148","ugo":"149","ali":"150","arr":"151","at ":"152","d t":"153","ht ":"154","i p":"155","ip\u00eb":"156","izi":"157","jn\u00eb":"158","n n":"159","ohe":"160","shu":"161","sh\u00eb":"162","t e":"163","tik":"164","a e":"165","ar\u00eb":"166","et\u00eb":"167","hum":"168","nd ":"169","ndr":"170","osh":"171","ova":"172","rim":"173","tos":"174","va ":"175"," fa":"176"," fi":"177","a s":"178","hen":"179","i n":"180","mar":"181","ndo":"182","por":"183","ris":"184","sa ":"185","sis":"186","t\u00ebs":"187","um\u00eb":"188","viz":"189","zit":"190"," di":"191"," mb":"192","aj ":"193","ana":"194","ata":"195","d\u00ebr":"196","e a":"197","esh":"198","ime":"199","jes":"200","lar":"201","n s":"202","nte":"203","pol":"204","r n":"205","ran":"206","res":"207","rr\u00eb":"208","tar":"209","\u00eb a":"210","\u00eb i":"211"," at":"212"," jo":"213"," k\u00eb":"214"," re":"215","a k":"216","ai ":"217","akt":"218","h\u00eb ":"219","h\u00ebn":"220","i i":"221","i m":"222","ia ":"223","men":"224","nis":"225","shm":"226","str":"227","t k":"228","t n":"229","t s":"230","\u00eb g":"231","\u00ebrk":"232","\u00ebve":"233"," ai":"234"," ci":"235"," ed":"236"," ja":"237"," kr":"238"," qe":"239"," ta":"240"," ve":"241","a p":"242","cil":"243","el ":"244","er\u00eb":"245","gji":"246","hte":"247","i t":"248","jen":"249","jit":"250","k d":"251","m\u00ebn":"252","n t":"253","nyr":"254","ori":"255","pas":"256","ra ":"257","rie":"258","r\u00ebs":"259","tor":"260","uaj":"261","yre":"262","\u00ebm ":"263","\u00ebny":"264"," ar":"265"," du":"266"," ga":"267"," je":"268","d\u00ebs":"269","e e":"270","e z":"271","ha ":"272","hme":"273","ika":"274","ini":"275","ite":"276","ith":"277","koh":"278","kra":"279","ku ":"280","lim":"281","lis":"282","q\u00ebn":"283","r\u00ebn":"284","s s":"285","t d":"286","t t":"287","tir":"288","t\u00ebn":"289","ver":"290","\u00eb j":"291"," ba":"292"," in":"293"," tr":"294"," zg":"295","a a":"296","a m":"297","a t":"298","abr":"299"},"arabic":{" \u0627\u0644":"0","\u0627\u0644\u0639":"1","\u0644\u0639\u0631":"2","\u0639\u0631\u0627":"3","\u0631\u0627\u0642":"4"," \u0641\u064a":"5","\u0641\u064a ":"6","\u064a\u0646 ":"7","\u064a\u0629 ":"8","\u0646 \u0627":"9","\u0627\u0644\u0645":"10","\u0627\u062a ":"11","\u0645\u0646 ":"12","\u064a \u0627":"13"," \u0645\u0646":"14","\u0627\u0644\u0623":"15","\u0629 \u0627":"16","\u0627\u0642 ":"17"," \u0648\u0627":"18","\u0627\u0621 ":"19","\u0627\u0644\u0625":"20"," \u0623\u0646":"21","\u0648\u0627\u0644":"22","\u0645\u0627 ":"23"," \u0639\u0644":"24","\u0644\u0649 ":"25","\u062a \u0627":"26","\u0648\u0646 ":"27","\u0647\u0645 ":"28","\u0627\u0642\u064a":"29","\u0627\u0645 ":"30","\u0644 \u0627":"31","\u0623\u0646 ":"32","\u0645 \u0627":"33","\u0627\u0644\u062a":"34","\u0644\u0627 ":"35","\u0627\u0644\u0627":"36","\u0627\u0646 ":"37","\u0647\u0627 ":"38","\u0627\u0644 ":"39","\u0629 \u0648":"40","\u0627 \u0627":"41","\u0631\u0647\u0627":"42","\u0644\u0627\u0645":"43","\u064a\u064a\u0646":"44"," \u0648\u0644":"45","\u0644\u0623\u0645":"46","\u0646\u0627 ":"47","\u0639\u0644\u0649":"48","\u0646 \u064a":"49","\u0627\u0644\u0628":"50","\u0627\u062f ":"51","\u0627\u0644\u0642":"52","\u062f \u0627":"53","\u0630\u0627 ":"54","\u0647 \u0627":"55"," \u0628\u0627":"56","\u0627\u0644\u062f":"57","\u0628 \u0627":"58","\u0645\u0631\u064a":"59","\u0644\u0645 ":"60"," \u0625\u0646":"61"," \u0644\u0644":"62","\u0633\u0644\u0627":"63","\u0623\u0645\u0631":"64","\u0631\u064a\u0643":"65","\u0645\u0629 ":"66","\u0649 \u0627":"67","\u0627 \u064a":"68"," \u0639\u0646":"69"," \u0647\u0630":"70","\u0621 \u0627":"71","\u0631 \u0627":"72","\u0643\u0627\u0646":"73","\u0642\u062a\u0644":"74","\u0625\u0633\u0644":"75","\u0627\u0644\u062d":"76","\u0648\u0627 ":"77"," \u0625\u0644":"78","\u0627 \u0623":"79","\u0628\u0627\u0644":"80","\u0646 \u0645":"81","\u0627\u0644\u0633":"82","\u0631\u0629 ":"83","\u0644\u0625\u0633":"84","\u0646 \u0648":"85","\u0647\u0627\u0628":"86","\u064a \u0648":"87","\u064a\u0631 ":"88"," \u0643\u0627":"89","\u0644\u0629 ":"90","\u064a\u0627\u062a":"91"," \u0644\u0627":"92","\u0627\u0646\u062a":"93","\u0646 \u0623":"94","\u064a\u0643\u064a":"95","\u0627\u0644\u0631":"96","\u0627\u0644\u0648":"97","\u0629 \u0641":"98","\u062f\u0629 ":"99","\u0627\u0644\u062c":"100","\u0642\u064a ":"101","\u0648\u064a ":"102","\u0627\u0644\u0630":"103","\u0627\u0644\u0634":"104","\u0627\u0645\u064a":"105","\u0627\u0646\u064a":"106","\u0630\u0647 ":"107","\u0639\u0646 ":"108","\u0644\u0645\u0627":"109","\u0647\u0630\u0647":"110","\u0648\u0644 ":"111","\u0627\u0641 ":"112","\u0627\u0648\u064a":"113","\u0628\u0631\u064a":"114","\u0629 \u0644":"115"," \u0623\u0645":"116"," \u0644\u0645":"117"," \u0645\u0627":"118","\u064a\u062f ":"119"," \u0623\u064a":"120","\u0625\u0631\u0647":"121","\u0639 \u0627":"122","\u0639\u0645\u0644":"123","\u0648\u0644\u0627":"124","\u0625\u0644\u0649":"125","\u0627\u0628\u064a":"126","\u0646 \u0641":"127","\u062e\u062a\u0637":"128","\u0644\u0643 ":"129","\u0646\u0647 ":"130","\u0646\u064a ":"131","\u0625\u0646 ":"132","\u062f\u064a\u0646":"133","\u0641 \u0627":"134","\u0644\u0630\u064a":"135","\u064a \u0623":"136","\u064a \u0628":"137"," \u0648\u0623":"138","\u0627 \u0639":"139","\u0627\u0644\u062e":"140","\u062a\u0644 ":"141","\u062a\u064a ":"142","\u0642\u062f ":"143","\u0644\u062f\u064a":"144"," \u0643\u0644":"145"," \u0645\u0639":"146","\u0627\u0628 ":"147","\u0627\u062e\u062a":"148","\u0627\u0631 ":"149","\u0627\u0644\u0646":"150","\u0639\u0644\u0627":"151","\u0645 \u0648":"152","\u0645\u0639 ":"153","\u0633 \u0627":"154","\u0643\u0644 ":"155","\u0644\u0627\u0621":"156","\u0646 \u0628":"157","\u0646 \u062a":"158","\u064a \u0645":"159","\u0639\u0631\u0628":"160","\u0645 \u0628":"161"," \u0648\u0642":"162"," \u064a\u0642":"163","\u0627 \u0644":"164","\u0627 \u0645":"165","\u0627\u0644\u0641":"166","\u062a\u0637\u0627":"167","\u062f\u0627\u062f":"168","\u0644\u0645\u0633":"169","\u0644\u0647 ":"170","\u0647\u0630\u0627":"171"," \u0645\u062d":"172","\u0624\u0644\u0627":"173","\u0628\u064a ":"174","\u0629 \u0645":"175","\u0646 \u0644":"176","\u0647\u0624\u0644":"177","\u0643\u0646 ":"178","\u0644\u0625\u0631":"179","\u0644\u062a\u064a":"180"," \u0623\u0648":"181"," \u0627\u0646":"182"," \u0639\u0645":"183","\u0627 \u0641":"184","\u0629 \u0623":"185","\u0637\u0627\u0641":"186","\u0639\u0628 ":"187","\u0644 \u0645":"188","\u0646 \u0639":"189","\u0648\u0631 ":"190","\u064a\u0627 ":"191"," \u064a\u0633":"192","\u0627 \u062a":"193","\u0629 \u0628":"194","\u0631\u0627\u0621":"195","\u0639\u0627\u0644":"196","\u0642\u0648\u0627":"197","\u0642\u064a\u0629":"198","\u0644\u0639\u0627":"199","\u0645 \u064a":"200","\u0645\u064a ":"201","\u0645\u064a\u0629":"202","\u0646\u064a\u0629":"203","\u0623\u064a ":"204","\u0627\u0628\u0627":"205","\u0628\u063a\u062f":"206","\u0628\u0644 ":"207","\u0631\u0628 ":"208","\u0639\u0645\u0627":"209","\u063a\u062f\u0627":"210","\u0645\u0627\u0644":"211","\u0645\u0644\u064a":"212","\u064a\u0633 ":"213"," \u0628\u0623":"214"," \u0628\u0639":"215"," \u0628\u063a":"216"," \u0648\u0645":"217","\u0628\u0627\u062a":"218","\u0628\u064a\u0629":"219","\u0630\u0644\u0643":"220","\u0639\u0629 ":"221","\u0642\u0627\u0648":"222","\u0642\u064a\u064a":"223","\u0643\u064a ":"224","\u0645 \u0645":"225","\u064a \u0639":"226"," \u0639\u0631":"227"," \u0642\u0627":"228","\u0627 \u0648":"229","\u0631\u0649 ":"230","\u0642 \u0627":"231","\u0648\u0627\u062a":"232","\u0648\u0645 ":"233"," \u0647\u0624":"234","\u0627 \u0628":"235","\u062f\u0627\u0645":"236","\u062f\u064a ":"237","\u0631\u0627\u062a":"238","\u0634\u0639\u0628":"239","\u0644\u0627\u0646":"240","\u0644\u0634\u0639":"241","\u0644\u0642\u0648":"242","\u0644\u064a\u0627":"243","\u0646 \u0647":"244","\u064a \u062a":"245","\u064a \u064a":"246"," \u0648\u0647":"247"," \u064a\u062d":"248","\u062c\u0631\u0627":"249","\u062c\u0645\u0627":"250","\u062d\u0645\u062f":"251","\u062f\u0645 ":"252","\u0643\u0645 ":"253","\u0644\u0627\u0648":"254","\u0644\u0631\u0647":"255","\u0645\u0627\u0639":"256","\u0646 \u0642":"257","\u0646\u0629 ":"258","\u0647\u064a ":"259"," \u0628\u0644":"260"," \u0628\u0647":"261"," \u0644\u0647":"262"," \u0648\u064a":"263","\u0627 \u0643":"264","\u0627\u0630\u0627":"265","\u0627\u0639 ":"266","\u062a \u0645":"267","\u062a\u062e\u0627":"268","\u062e\u0627\u0628":"269","\u0631 \u0645":"270","\u0644\u0645\u062a":"271","\u0645\u0633\u0644":"272","\u0649 \u0623":"273","\u064a\u0633\u062a":"274","\u064a\u0637\u0627":"275"," \u0644\u0623":"276"," \u0644\u064a":"277","\u0623\u0645\u0646":"278","\u0627\u0633\u062a":"279","\u0628\u0639\u0636":"280","\u0629 \u062a":"281","\u0631\u064a ":"282","\u0635\u062f\u0627":"283","\u0642 \u0648":"284","\u0642\u0648\u0644":"285","\u0645\u062f ":"286","\u0646\u062a\u062e":"287","\u0646\u0641\u0633":"288","\u0646\u0647\u0627":"289","\u0647\u0646\u0627":"290","\u0623\u0639\u0645":"291","\u0623\u0646\u0647":"292","\u0627\u0626\u0646":"293","\u0627\u0644\u0622":"294","\u0627\u0644\u0643":"295","\u062d\u0629 ":"296","\u062f \u0645":"297","\u0631 \u0639":"298","\u0631\u0628\u064a":"299"},"azeri":{"l\u0259r":"0","in ":"1","\u0131n ":"2","lar":"3","da ":"4","an ":"5","ir ":"6","d\u0259 ":"7","ki ":"8"," bi":"9","\u0259n ":"10","\u0259ri":"11","ar\u0131":"12","\u0259r ":"13","dir":"14","nda":"15"," ki":"16","rin":"17","n\u0131n":"18","\u0259si":"19","ini":"20"," ed":"21"," qa":"22"," t\u0259":"23"," ba":"24"," ol":"25","as\u0131":"26","il\u0259":"27","r\u0131n":"28"," ya":"29","an\u0131":"30"," v\u0259":"31","nd\u0259":"32","ni ":"33","ara":"34","\u0131n\u0131":"35","\u0131nd":"36"," bu":"37","si ":"38","ib ":"39","aq ":"40","d\u0259n":"41","iya":"42","n\u0259 ":"43","r\u0259 ":"44","n b":"45","s\u0131n":"46","v\u0259 ":"47","iri":"48","l\u0259 ":"49","nin":"50","\u0259li":"51"," de":"52"," m\u00fc":"53","bir":"54","n s":"55","ri ":"56","\u0259k ":"57"," az":"58"," s\u0259":"59","ar ":"60","bil":"61","z\u0259r":"62","bu ":"63","dan":"64","edi":"65","ind":"66","man":"67","un ":"68","\u0259r\u0259":"69"," ha":"70","lan":"71","yy\u0259":"72","iyy":"73"," il":"74"," ne":"75","r k":"76","\u0259 b":"77"," is":"78","na ":"79","nun":"80","\u0131r ":"81"," da":"82"," h\u0259":"83","a b":"84","in\u0259":"85","sin":"86","yan":"87","\u0259rb":"88"," d\u0259":"89"," m\u0259":"90"," q\u0259":"91","d\u0131r":"92","li ":"93","ola":"94","rba":"95","az\u0259":"96","can":"97","l\u0131 ":"98","nla":"99"," et":"100"," g\u00f6":"101","al\u0131":"102","ayc":"103","bay":"104","eft":"105","ist":"106","n i":"107","nef":"108","tl\u0259":"109","yca":"110","y\u0259t":"111","\u0259c\u0259":"112"," la":"113","ild":"114","n\u0131 ":"115","tin":"116","ldi":"117","lik":"118","n h":"119","n m":"120","oyu":"121","raq":"122","ya ":"123","\u0259ti":"124"," ar":"125","ada":"126","ed\u0259":"127","mas":"128","s\u0131 ":"129","\u0131na":"130","\u0259 d":"131","\u0259l\u0259":"132","ay\u0131":"133","iyi":"134","lma":"135","m\u0259k":"136","n d":"137","ti ":"138","yin":"139","yun":"140","\u0259t ":"141","az\u0131":"142","ft ":"143","i t":"144","lli":"145","n a":"146","ra ":"147"," c\u0259":"148"," g\u0259":"149"," ko":"150"," n\u0259":"151"," oy":"152","a d":"153","ana":"154","c\u0259k":"155","eyi":"156","ilm":"157","irl":"158","lay":"159","liy":"160","lub":"161","n \u0259":"162","ril":"163","rl\u0259":"164","unu":"165","ver":"166","\u00fcn ":"167","\u0259 o":"168","\u0259ni":"169"," he":"170"," ma":"171"," on":"172"," pa":"173","ala":"174","dey":"175","i m":"176","ima":"177","lm\u0259":"178","m\u0259t":"179","par":"180","y\u0259 ":"181","\u0259tl":"182"," al":"183"," mi":"184"," sa":"185"," \u0259l":"186","ad\u0131":"187","ak\u0131":"188","and":"189","ard":"190","art":"191","ayi":"192","i a":"193","i q":"194","i y":"195","ili":"196","ill":"197","is\u0259":"198","n o":"199","n q":"200","olu":"201","rla":"202","st\u0259":"203","s\u0259 ":"204","tan":"205","tel":"206","yar":"207","\u0259d\u0259":"208"," me":"209"," r\u0259":"210"," ve":"211"," ye":"212","a k":"213","at ":"214","ba\u015f":"215","diy":"216","ent":"217","eti":"218","h\u0259s":"219","i i":"220","ik ":"221","la ":"222","mi\u015f":"223","n n":"224","nu ":"225","qar":"226","ran":"227","t\u0259r":"228","xan":"229","\u0259 a":"230","\u0259 g":"231","\u0259 t":"232"," d\u00fc":"233","ama":"234","b k":"235","dil":"236","era":"237","etm":"238","i b":"239","kil":"240","mil":"241","n r":"242","qla":"243","r s":"244","ras":"245","siy":"246","son":"247","tim":"248","yer":"249","\u0259 k":"250"," g\u00fc":"251"," so":"252"," s\u00f6":"253"," te":"254"," xa":"255","ai ":"256","bar":"257","cti":"258","di ":"259","eri":"260","g\u00f6r":"261","g\u00fcn":"262","g\u0259l":"263","hb\u0259":"264","ih\u0259":"265","iki":"266","isi":"267","lin":"268","mai":"269","maq":"270","n k":"271","n t":"272","n v":"273","onu":"274","qan":"275","q\u0259z":"276","t\u0259 ":"277","xal":"278","yib":"279","yih":"280","zet":"281","z\u0131r":"282","\u0131b ":"283","\u0259 m":"284","\u0259ze":"285"," br":"286"," in":"287"," i\u0307":"288"," pr":"289"," ta":"290"," to":"291"," \u00fc\u00e7":"292","a o":"293","ali":"294","ani":"295","anl":"296","aql":"297","azi":"298","bri":"299"},"bengali":{"\u09be\u09b0 ":"0","\u09af\u09bc ":"1","\u09c7\u09af\u09bc":"2","\u09af\u09bc\u09be":"3"," \u0995\u09b0":"4","\u09c7\u09a4 ":"5"," \u0995\u09be":"6"," \u09aa\u09be":"7"," \u09a4\u09be":"8","\u09a8\u09be ":"9","\u09be\u09af\u09bc":"10","\u09c7\u09b0 ":"11","\u09af\u09bc\u09c7":"12"," \u09ac\u09be":"13","\u09c7\u09ac ":"14"," \u09af\u09be":"15"," \u09b9\u09c7":"16"," \u09b8\u09be":"17","\u09be\u09a8 ":"18","\u09c7\u099b ":"19"," \u09bf\u09a8":"20","\u09c7\u09b2 ":"21"," \u09bf\u09a6":"22"," \u09a8\u09be":"23"," \u09bf\u09ac":"24","\u09c7\u0995 ":"25","\u09b2\u09be ":"26","\u09a4\u09be ":"27"," \u09ac\u0a98":"28"," \u09bf\u0995":"29","\u0995\u09b0\u09c7":"30"," \u09aa\u0a9a":"31","\u09be\u09c7\u09b0":"32","\u09bf\u09a8\u09c7":"33","\u09b0\u09be ":"34"," \u09cb\u09ac":"35","\u0995\u09be ":"36"," \u0995\u09c7":"37"," \u099f\u09be":"38","\u09b0 \u0995":"39","\u09c7\u09b2\u09be":"40"," \u09cb\u0995":"41"," \u09ae\u09be":"42"," \u09cb\u09a6":"43"," \u09cb\u09ae":"44","\u09a6\u09b0 ":"45","\u09bc\u09be ":"46","\u09bf\u09a6\u09c7":"47","\u09be\u0995\u09be":"48","\u09bc\u09c7\u099b":"49","\u09c7\u09a6\u09b0":"50"," \u0986\u09c7":"51"," \u0993 ":"52","\u09be\u09b2 ":"53","\u09bf\u099f ":"54"," \u09ae\u09c1":"55","\u0995\u09c7\u09b0":"56","\u09b9\u09af\u09bc":"57","\u0995\u09b0\u09be":"58","\u09aa\u09b0 ":"59","\u09aa\u09be\u09c7":"60"," \u098f\u0995":"61"," \u09aa\u09a6":"62","\u099f\u09be\u0995":"63","\u09a1\u09bc ":"64","\u0995\u09be\u09a8":"65","\u099f\u09be ":"66","\u09a6\u0a97\u09be":"67","\u09aa\u09a6\u0a97":"68","\u09be\u09a1\u09bc":"69","\u09cb\u0995\u09be":"70","\u0993\u09af\u09bc":"71","\u0995\u09be\u09aa":"72","\u09b9\u09c7\u09af":"73","\u09c7\u09a8\u09b0":"74"," \u09b9\u09af":"75","\u09a6\u09c7\u09af":"76","\u09a8\u09b0 ":"77","\u09be\u09a8\u09be":"78","\u09be\u09c7\u09b2":"79"," \u0986\u09b0":"80"," \u09bc ":"81","\u09ac\u0a98\u09ac":"82","\u09bf\u09af\u09bc":"83"," \u09a6\u09be":"84"," \u09b8\u09ae":"85","\u0995\u09be\u09b0":"86","\u09b9\u09be\u09b0":"87","\u09be\u0987 ":"88","\u09a1\u09bc\u09be":"89","\u09bf\u09ac\u09bf":"90"," \u09b0\u09be":"91"," \u09b2\u09be":"92","\u09a8\u09be\u09b0":"93","\u09ac\u09b9\u09be":"94","\u09ac\u09be ":"95","\u09af\u09be\u09af":"96","\u09c7\u09a8 ":"97","\u0a98\u09ac\u09b9":"98"," \u09ad\u09be":"99"," \u09b8\u09c7":"100"," \u09cb\u09af":"101","\u09b0\u09b0 ":"102","\u09bc\u09be\u09b0":"103","\u09bc\u09be\u09b2":"104","\u0a97\u09be ":"105","\u09a5\u09c7\u0995":"106","\u09ad\u09be\u09c7":"107","\u09bc\u09c7 ":"108","\u09c7\u09b0\u09b0":"109"," \u09a7\u09b0":"110"," \u09b9\u09be":"111","\u09a8\u0a98 ":"112","\u09b0\u09c7\u09a8":"113","\u09be\u09c7\u09ac":"114","\u09bf\u09a1\u09bc":"115","\u09bf\u09b0 ":"116"," \u09cb\u09a5":"117","\u09a4\u09be\u09b0":"118","\u09ac\u09bf\u09ad":"119","\u09b0\u09c7\u09a4":"120","\u09b8\u09be\u09c7":"121","\u09be\u0995\u09c7":"122","\u09be\u09c7\u09a4":"123","\u09bf\u09ad\u0a2d":"124","\u09c7 \u09ac":"125","\u09cb\u09a5\u09c7":"126"," \u09cb\u09aa":"127"," \u09cb\u09b8":"128","\u09ac\u09be\u09b0":"129","\u09ad\u0a2d ":"130","\u09b0\u09a8 ":"131","\u09be\u09ae ":"132"," \u098f\u0996":"133","\u0986\u09b0 ":"134","\u0995\u09be\u09c7":"135","\u09a6\u09a8 ":"136","\u09b8\u09be\u099c":"137","\u09be\u09c7\u0995":"138","\u09be\u09c7\u09a8":"139","\u09c7\u09a8\u09be":"140"," \u0998\u09c7":"141"," \u09a4\u09c7":"142"," \u09b0\u09c7":"143","\u09a4\u09c7\u09ac":"144","\u09ac\u09a8 ":"145","\u09ac\u0a98\u09be":"146","\u09c7\u09a1\u09bc":"147","\u09c7\u09ac\u09a8":"148"," \u0996\u09c1":"149"," \u099a\u09be":"150"," \u09b8\u09c1":"151","\u0995\u09c7 ":"152","\u09a7\u09b0\u09c7":"153","\u09b0 \u09cb":"154","\u09bc \u09bf":"155","\u09be \u09bf":"156","\u09be\u09c7\u09a5":"157","\u09be\u0a20\u09be":"158","\u09bf\u09a6 ":"159","\u09bf\u09a8 ":"160"," \u0985\u09a8":"161"," \u0986\u09aa":"162"," \u0986\u09ae":"163"," \u09a5\u09be":"164"," \u09ac\u0a9a":"165"," \u09cb\u09ab":"166"," \u09cc\u09a4":"167","\u0998\u09c7\u09b0":"168","\u09a4\u09c7 ":"169","\u09ae\u09af\u09bc":"170","\u09af\u09be\u0a20":"171","\u09b0 \u09b8":"172","\u09b0\u09be\u0996":"173","\u09be \u09ac":"174","\u09be \u09cb":"175","\u09be\u09b2\u09be":"176","\u09bf\u0995 ":"177","\u09bf\u09b6 ":"178","\u09c7\u0996 ":"179"," \u098f\u09b0":"180"," \u099a\u0a93":"181"," \u09bf\u09a1":"182","\u0996\u09a8 ":"183","\u09a1\u09bc\u09c7":"184","\u09b0 \u09ac":"185","\u09bc\u09b0 ":"186","\u09be\u0987\u09c7":"187","\u09be\u09c7\u09a6":"188","\u09bf\u09a6\u09a8":"189","\u09c7\u09b0\u09a8":"190"," \u09a4\u0a74":"191","\u099b\u09be\u09a1":"192","\u099c\u09a8\u0a98":"193","\u09a4\u09be\u0987":"194","\u09ae\u09be ":"195","\u09ae\u09be\u09c7":"196","\u09b2\u09be\u09b0":"197","\u09be\u099c ":"198","\u09be\u09a4\u09be":"199","\u09be\u09ae\u09be":"200","\u0a0a\u09c7\u09b2":"201","\u0a97\u09be\u09b0":"202"," \u09b8\u09ac":"203","\u0986\u09aa\u09a8":"204","\u098f\u0995\u099f":"205","\u0995\u09be\u09bf":"206","\u099c\u09be\u0987":"207","\u099f\u09b0 ":"208","\u09a1\u099c\u09be":"209","\u09a6\u09c7\u0996":"210","\u09aa\u09a8\u09be":"211","\u09b0\u0993 ":"212","\u09b2\u09c7 ":"213","\u09b9\u09c7\u09ac":"214","\u09be\u099c\u09be":"215","\u09be\u09bf\u099f":"216","\u09bf\u09a1\u099c":"217","\u09c7\u09a5 ":"218"," \u098f\u09ac":"219"," \u099c\u09a8":"220"," \u099c\u09be":"221","\u0986\u09ae\u09be":"222","\u0997\u09c7\u09b2":"223","\u099c\u09be\u09a8":"224","\u09a8\u09c7\u09a4":"225","\u09ac\u09bf\u09b6":"226","\u09ae\u09c1\u09c7":"227","\u09ae\u09c7\u09af":"228","\u09b0 \u09aa":"229","\u09b8\u09c7 ":"230","\u09b9\u09c7\u09b2":"231","\u09bc \u09cb":"232","\u09be \u09b9":"233","\u09be\u0993\u09af":"234","\u09cb\u09ae\u0995":"235","\u0a98\u09be\u09bf":"236"," \u0985\u09c7":"237"," \u099f ":"238"," \u09cb\u0997":"239"," \u09cb\u09a8":"240","\u099c\u09b0 ":"241","\u09a4\u09bf\u09b0":"242","\u09a6\u09be\u09ae":"243","\u09aa\u09a1\u09bc":"244","\u09aa\u09be\u09b0":"245","\u09ac\u09be\u0998":"246","\u09ae\u0995\u09be":"247","\u09ae\u09be\u09ae":"248","\u09af\u09bc\u09b0":"249","\u09af\u09be\u09c7":"250","\u09b0 \u09ae":"251","\u09b0\u09c7 ":"252","\u09b2\u09b0 ":"253","\u09be \u0995":"254","\u09be\u0997 ":"255","\u09be\u09ac\u09be":"256","\u09be\u09b0\u09be":"257","\u09be\u09bf\u09a8":"258","\u09c7 \u0997":"259","\u09c7\u0997 ":"260","\u09c7\u09b2\u09b0":"261","\u09cb\u09a6\u0996":"262","\u09cb\u09ac\u09bf":"263","\u0a93\u09b2 ":"264"," \u09a6\u09c7":"265"," \u09aa\u09c1":"266"," \u09ac\u09c7":"267","\u0985\u09c7\u09a8":"268","\u098f\u0996\u09a8":"269","\u0995\u099b\u09c1":"270","\u0995\u09be\u09b2":"271","\u0997\u09c7\u09af":"272","\u099b\u09a8 ":"273","\u09a4 \u09aa":"274","\u09a8\u09c7\u09af":"275","\u09aa\u09be\u09bf":"276","\u09ae\u09a8 ":"277","\u09b0 \u0986":"278","\u09b0\u09be\u09b0":"279","\u09be\u0993 ":"280","\u09be\u09aa ":"281","\u09bf\u0995\u099b":"282","\u09bf\u0997\u09c7":"283","\u09c7\u099b\u09a8":"284","\u09c7\u099c\u09b0":"285","\u09cb\u09ae\u09be":"286","\u09cb\u09ae\u09c7":"287","\u09cc\u09a4\u09bf":"288","\u0a98\u09be\u09c7":"289"," ' ":"290"," \u098f\u099b":"291"," \u099b\u09be":"292"," \u09ac\u09b2":"293"," \u09af\u09bf":"294"," \u09b6\u09bf":"295"," \u09bf\u09ae":"296"," \u09cb\u09b2":"297","\u098f\u099b\u09be":"298","\u0996\u09be ":"299"},"bulgarian":{"\u043d\u0430 ":"0"," \u043d\u0430":"1","\u0442\u043e ":"2"," \u043f\u0440":"3"," \u0437\u0430":"4","\u0442\u0430 ":"5"," \u043f\u043e":"6","\u0438\u0442\u0435":"7","\u0442\u0435 ":"8","\u0430 \u043f":"9","\u0430 \u0441":"10"," \u043e\u0442":"11","\u0437\u0430 ":"12","\u0430\u0442\u0430":"13","\u0438\u044f ":"14"," \u0432 ":"15","\u0435 \u043d":"16"," \u0434\u0430":"17","\u0430 \u043d":"18"," \u0441\u0435":"19"," \u043a\u043e":"20","\u0434\u0430 ":"21","\u043e\u0442 ":"22","\u0430\u043d\u0438":"23","\u043f\u0440\u0435":"24","\u043d\u0435 ":"25","\u0435\u043d\u0438":"26","\u043e \u043d":"27","\u043d\u0438 ":"28","\u0441\u0435 ":"29"," \u0438 ":"30","\u043d\u043e ":"31","\u0430\u043d\u0435":"32","\u0435\u0442\u043e":"33","\u0430 \u0432":"34","\u0432\u0430 ":"35","\u0432\u0430\u043d":"36","\u0435 \u043f":"37","\u0430 \u043e":"38","\u043e\u0442\u043e":"39","\u0440\u0430\u043d":"40","\u0430\u0442 ":"41","\u0440\u0435\u0434":"42"," \u043d\u0435":"43","\u0430 \u0434":"44","\u0438 \u043f":"45"," \u0434\u043e":"46","\u043f\u0440\u043e":"47"," \u0441\u044a":"48","\u043b\u0438 ":"49","\u043f\u0440\u0438":"50","\u043d\u0438\u044f":"51","\u0441\u043a\u0438":"52","\u0442\u0435\u043b":"53","\u0430 \u0438":"54","\u043f\u043e ":"55","\u0440\u0438 ":"56"," \u0435 ":"57"," \u043a\u0430":"58","\u0438\u0440\u0430":"59","\u043a\u0430\u0442":"60","\u043d\u0438\u0435":"61","\u043d\u0438\u0442":"62","\u0435 \u0437":"63","\u0438 \u0441":"64","\u043e \u0441":"65","\u043e\u0441\u0442":"66","\u0447\u0435 ":"67"," \u0440\u0430":"68","\u0438\u0441\u0442":"69","\u043e \u043f":"70"," \u0438\u0437":"71"," \u0441\u0430":"72","\u0435 \u0434":"73","\u0438\u043d\u0438":"74","\u043a\u0438 ":"75","\u043c\u0438\u043d":"76"," \u043c\u0438":"77","\u0430 \u0431":"78","\u0430\u0432\u0430":"79","\u0435 \u0432":"80","\u0438\u0435 ":"81","\u043f\u043e\u043b":"82","\u0441\u0442\u0432":"83","\u0442 \u043d":"84"," \u0432\u044a":"85"," \u0441\u0442":"86"," \u0442\u043e":"87","\u0430\u0437\u0430":"88","\u0435 \u043e":"89","\u043e\u0432 ":"90","\u0441\u0442 ":"91","\u044a\u0442 ":"92","\u0438 \u043d":"93","\u0438\u044f\u0442":"94","\u043d\u0430\u0442":"95","\u0440\u0430 ":"96"," \u0431\u044a":"97"," \u0447\u0435":"98","\u0430\u043b\u043d":"99","\u0435 \u0441":"100","\u0435\u043d ":"101","\u0435\u0441\u0442":"102","\u0438 \u0434":"103","\u043b\u0435\u043d":"104","\u043d\u0438\u0441":"105","\u043e \u043e":"106","\u043e\u0432\u0438":"107"," \u043e\u0431":"108"," \u0441\u043b":"109","\u0430 \u0440":"110","\u0430\u0442\u043e":"111","\u043a\u043e\u043d":"112","\u043d\u043e\u0441":"113","\u0440\u043e\u0432":"114","\u0449\u0435 ":"115"," \u0440\u0435":"116"," \u0441 ":"117"," \u0441\u043f":"118","\u0432\u0430\u0442":"119","\u0435\u0448\u0435":"120","\u0438 \u0432":"121","\u0438\u0435\u0442":"122","\u043e \u0432":"123","\u043e\u0432\u0435":"124","\u0441\u0442\u0430":"125","\u0430 \u043a":"126","\u0430 \u0442":"127","\u0434\u0430\u0442":"128","\u0435\u043d\u0442":"129","\u043a\u0430 ":"130","\u043b\u0435\u0434":"131","\u043d\u0435\u0442":"132","\u043e\u0440\u0438":"133","\u0441\u0442\u0440":"134","\u0441\u0442\u044a":"135","\u0442\u0438 ":"136","\u0442\u044a\u0440":"137"," \u0442\u0435":"138","\u0430 \u0437":"139","\u0430 \u043c":"140","\u0430\u0434 ":"141","\u0430\u043d\u0430":"142","\u0435\u043d\u043e":"143","\u0438 \u043e":"144","\u0438\u043d\u0430":"145","\u0438\u0442\u0438":"146","\u043c\u0430 ":"147","\u0441\u043a\u0430":"148","\u0441\u043b\u0435":"149","\u0442\u0432\u043e":"150","\u0442\u0435\u0440":"151","\u0446\u0438\u044f":"152","\u044f\u0442 ":"153"," \u0431\u0435":"154"," \u0434\u0435":"155"," \u043f\u0430":"156","\u0430\u0442\u0435":"157","\u0432\u0435\u043d":"158","\u0432\u0438 ":"159","\u0432\u0438\u0442":"160","\u0438 \u0437":"161","\u0438 \u0438":"162","\u043d\u0430\u0440":"163","\u043d\u043e\u0432":"164","\u043e\u0432\u0430":"165","\u043f\u043e\u0432":"166","\u0440\u0435\u0437":"167","\u0440\u0438\u0442":"168","\u0441\u0430 ":"169","\u044f\u0442\u0430":"170"," \u0433\u043e":"171"," \u0449\u0435":"172","\u0430\u043b\u0438":"173","\u0432 \u043f":"174","\u0433\u0440\u0430":"175","\u0435 \u0438":"176","\u0435\u0434\u0438":"177","\u0435\u043b\u0438":"178","\u0438\u043b\u0438":"179","\u043a\u0430\u0437":"180","\u043a\u0438\u0442":"181","\u043b\u043d\u043e":"182","\u043c\u0435\u043d":"183","\u043e\u043b\u0438":"184","\u0440\u0430\u0437":"185"," \u0432\u0435":"186"," \u0433\u0440":"187"," \u0438\u043c":"188"," \u043c\u0435":"189"," \u043f\u044a":"190","\u0430\u0432\u0438":"191","\u0430\u043a\u043e":"192","\u0430\u0447\u0430":"193","\u0432\u0438\u043d":"194","\u0432\u043e ":"195","\u0433\u043e\u0432":"196","\u0434\u0430\u043d":"197","\u0434\u0438 ":"198","\u0434\u043e ":"199","\u0435\u0434 ":"200","\u0435\u0440\u0438":"201","\u0435\u0440\u043e":"202","\u0436\u0434\u0430":"203","\u0438\u0442\u043e":"204","\u043a\u043e\u0432":"205","\u043a\u043e\u043b":"206","\u043b\u043d\u0438":"207","\u043c\u0435\u0440":"208","\u043d\u0430\u0447":"209","\u043e \u0437":"210","\u043e\u043b\u0430":"211","\u043e\u043d ":"212","\u043e\u043d\u0430":"213","\u043f\u0440\u0430":"214","\u0440\u0430\u0432":"215","\u0440\u0435\u043c":"216","\u0441\u0438\u044f":"217","\u0441\u0442\u0438":"218","\u0442 \u043f":"219","\u0442\u0430\u043d":"220","\u0445\u0430 ":"221","\u0448\u0435 ":"222","\u0448\u0435\u043d":"223","\u044a\u043b\u0433":"224"," \u0431\u0430":"225"," \u0441\u0438":"226","\u0430\u0440\u043e":"227","\u0431\u044a\u043b":"228","\u0432 \u0440":"229","\u0433\u0430\u0440":"230","\u0435 \u0435":"231","\u0435\u043b\u043d":"232","\u0435\u043c\u0435":"233","\u0438\u043a\u043e":"234","\u0438\u043c\u0430":"235","\u043a\u043e ":"236","\u043a\u043e\u0438":"237","\u043b\u0430 ":"238","\u043b\u0433\u0430":"239","\u043e \u0434":"240","\u043e\u0437\u0438":"241","\u043e\u0438\u0442":"242","\u043f\u043e\u0434":"243","\u0440\u0435\u0441":"244","\u0440\u0438\u0435":"245","\u0441\u0442\u043e":"246","\u0442 \u043a":"247","\u0442 \u043c":"248","\u0442 \u0441":"249","\u0443\u0441\u0442":"250"," \u0431\u0438":"251"," \u0434\u0432":"252"," \u0434\u044a":"253"," \u043c\u0430":"254"," \u043c\u043e":"255"," \u043d\u0438":"256"," \u043e\u0441":"257","\u0430\u043b\u0430":"258","\u0430\u043d\u0441":"259","\u0430\u0440\u0430":"260","\u0430\u0442\u0438":"261","\u0430\u0446\u0438":"262","\u0431\u0435\u0448":"263","\u0432\u044a\u0440":"264","\u0435 \u0440":"265","\u0435\u0434\u0432":"266","\u0435\u043c\u0430":"267","\u0436\u0430\u0432":"268","\u0438 \u043a":"269","\u0438\u0430\u043b":"270","\u0438\u0446\u0430":"271","\u0438\u0447\u0435":"272","\u043a\u0438\u044f":"273","\u043b\u0438\u0442":"274","\u043e \u0431":"275","\u043e\u0432\u043e":"276","\u043e\u0434\u0438":"277","\u043e\u043a\u0430":"278","\u043f\u043e\u0441":"279","\u0440\u043e\u0434":"280","\u0441\u0435\u0434":"281","\u0441\u043b\u0443":"282","\u0442 \u0438":"283","\u0442\u043e\u0432":"284","\u0443\u0432\u0430":"285","\u0446\u0438\u0430":"286","\u0447\u0435\u0441":"287","\u044f \u0437":"288"," \u0432\u043e":"289"," \u0438\u043b":"290"," \u0441\u043a":"291"," \u0442\u0440":"292"," \u0446\u0435":"293","\u0430\u043c\u0438":"294","\u0430\u0440\u0438":"295","\u0431\u0430\u0442":"296","\u0431\u0438 ":"297","\u0431\u0440\u0430":"298","\u0431\u044a\u0434":"299"},"cebuano":{"ng ":"0","sa ":"1"," sa":"2","ang":"3","ga ":"4","nga":"5"," ka":"6"," ng":"7","an ":"8"," an":"9"," na":"10"," ma":"11"," ni":"12","a s":"13","a n":"14","on ":"15"," pa":"16"," si":"17","a k":"18","a m":"19"," ba":"20","ong":"21","a i":"22","ila":"23"," mg":"24","mga":"25","a p":"26","iya":"27","a a":"28","ay ":"29","ka ":"30","ala":"31","ing":"32","g m":"33","n s":"34","g n":"35","lan":"36"," gi":"37","na ":"38","ni ":"39","o s":"40","g p":"41","n n":"42"," da":"43","ag ":"44","pag":"45","g s":"46","yan":"47","ayo":"48","o n":"49","si ":"50"," mo":"51","a b":"52","g a":"53","ail":"54","g b":"55","han":"56","a d":"57","asu":"58","nag":"59","ya ":"60","man":"61","ne ":"62","pan":"63","kon":"64"," il":"65"," la":"66","aka":"67","ako":"68","ana":"69","bas":"70","ko ":"71","od ":"72","yo ":"73"," di":"74"," ko":"75"," ug":"76","a u":"77","g k":"78","kan":"79","la ":"80","len":"81","sur":"82","ug ":"83"," ai":"84","apa":"85","aw ":"86","d s":"87","g d":"88","g g":"89","ile":"90","nin":"91"," iy":"92"," su":"93","ene":"94","og ":"95","ot ":"96","aba":"97","aha":"98","as ":"99","imo":"100"," ki":"101","a t":"102","aga":"103","ban":"104","ero":"105","nan":"106","o k":"107","ran":"108","ron":"109","sil":"110","una":"111","usa":"112"," us":"113","a g":"114","ahi":"115","ani":"116","er ":"117","ha ":"118","i a":"119","rer":"120","yon":"121"," pu":"122","ini":"123","nak":"124","ro ":"125","to ":"126","ure":"127"," ed":"128"," og":"129"," wa":"130","ili":"131","mo ":"132","n a":"133","nd ":"134","o a":"135"," ad":"136"," du":"137"," pr":"138","aro":"139","i s":"140","ma ":"141","n m":"142","ulo":"143","und":"144"," ta":"145","ara":"146","asa":"147","ato":"148","awa":"149","dmu":"150","e n":"151","edm":"152","ina":"153","mak":"154","mun":"155","niy":"156","san":"157","wa ":"158"," tu":"159"," un":"160","a l":"161","bay":"162","iga":"163","ika":"164","ita":"165","kin":"166","lis":"167","may":"168","os ":"169"," ar":"170","ad ":"171","ali":"172","ama":"173","ers":"174","ipa":"175","isa":"176","mao":"177","nim":"178","t s":"179","tin":"180"," ak":"181"," ap":"182"," hi":"183","abo":"184","agp":"185","ano":"186","ata":"187","g i":"188","gan":"189","gka":"190","gpa":"191","i m":"192","iha":"193","k s":"194","law":"195","or ":"196","rs ":"197","siy":"198","tag":"199"," al":"200"," at":"201"," ha":"202"," hu":"203"," im":"204","a h":"205","bu ":"206","e s":"207","gma":"208","kas":"209","lag":"210","mon":"211","nah":"212","ngo":"213","r s":"214","ra ":"215","sab":"216","sam":"217","sul":"218","uba":"219","uha":"220"," lo":"221"," re":"222","ada":"223","aki":"224","aya":"225","bah":"226","ce ":"227","d n":"228","lab":"229","pa ":"230","pak":"231","s n":"232","s s":"233","tan":"234","taw":"235","te ":"236","uma":"237","ura":"238"," in":"239"," lu":"240","a c":"241","abi":"242","at ":"243","awo":"244","bat":"245","dal":"246","dla":"247","ele":"248","g t":"249","g u":"250","gay":"251","go ":"252","hab":"253","hin":"254","i e":"255","i n":"256","kab":"257","kap":"258","lay":"259","lin":"260","nil":"261","pam":"262","pas":"263","pro":"264","pul":"265","ta ":"266","ton":"267","uga":"268","ugm":"269","unt":"270"," co":"271"," gu":"272"," mi":"273"," pi":"274"," ti":"275","a o":"276","abu":"277","adl":"278","ado":"279","agh":"280","agk":"281","ao ":"282","art":"283","bal":"284","cit":"285","di ":"286","dto":"287","dun":"288","ent":"289","g e":"290","gon":"291","gug":"292","ia ":"293","iba":"294","ice":"295","in ":"296","inu":"297","it ":"298","kaa":"299"},"croatian":{"je ":"0"," na":"1"," pr":"2"," po":"3","na ":"4"," je":"5"," za":"6","ije":"7","ne ":"8"," i ":"9","ti ":"10","da ":"11"," ko":"12"," ne":"13","li ":"14"," bi":"15"," da":"16"," u ":"17","ma ":"18","mo ":"19","a n":"20","ih ":"21","za ":"22","a s":"23","ko ":"24","i s":"25","a p":"26","koj":"27","pro":"28","ju ":"29","se ":"30"," go":"31","ost":"32","to ":"33","va ":"34"," do":"35"," to":"36","e n":"37","i p":"38"," od":"39"," ra":"40","no ":"41","ako":"42","ka ":"43","ni ":"44"," ka":"45"," se":"46"," mo":"47"," st":"48","i n":"49","ima":"50","ja ":"51","pri":"52","vat":"53","sta":"54"," su":"55","ati":"56","e p":"57","ta ":"58","tsk":"59","e i":"60","nij":"61"," tr":"62","cij":"63","jen":"64","nos":"65","o s":"66"," iz":"67","om ":"68","tro":"69","ili":"70","iti":"71","pos":"72"," al":"73","a i":"74","a o":"75","e s":"76","ija":"77","ini":"78","pre":"79","str":"80","la ":"81","og ":"82","ovo":"83"," sv":"84","ekt":"85","nje":"86","o p":"87","odi":"88","rva":"89"," ni":"90","ali":"91","min":"92","rij":"93","a t":"94","a z":"95","ats":"96","iva":"97","o t":"98","od ":"99","oje":"100","ra ":"101"," hr":"102","a m":"103","a u":"104","hrv":"105","im ":"106","ke ":"107","o i":"108","ovi":"109","red":"110","riv":"111","te ":"112","bi ":"113","e o":"114","god":"115","i d":"116","lek":"117","umi":"118","zvo":"119","din":"120","e u":"121","ene":"122","jed":"123","ji ":"124","lje":"125","nog":"126","su ":"127"," a ":"128"," el":"129"," mi":"130"," o ":"131","a d":"132","alu":"133","ele":"134","i u":"135","izv":"136","ktr":"137","lum":"138","o d":"139","ori":"140","rad":"141","sto":"142","a k":"143","anj":"144","ava":"145","e k":"146","men":"147","nic":"148","o j":"149","oj ":"150","ove":"151","ski":"152","tvr":"153","una":"154","vor":"155"," di":"156"," no":"157"," s ":"158"," ta":"159"," tv":"160","i i":"161","i o":"162","kak":"163","ro\u0161":"164","sko":"165","vod":"166"," sa":"167"," \u0107e":"168","a b":"169","adi":"170","amo":"171","eni":"172","gov":"173","iju":"174","ku ":"175","o n":"176","ora":"177","rav":"178","ruj":"179","smo":"180","tav":"181","tru":"182","u p":"183","ve ":"184"," in":"185"," pl":"186","aci":"187","bit":"188","de ":"189","di\u0161":"190","ema":"191","i m":"192","ika":"193","i\u0161t":"194","jer":"195","ki ":"196","mog":"197","nik":"198","nov":"199","nu ":"200","oji":"201","oli":"202","pla":"203","pod":"204","st ":"205","sti":"206","tra":"207","tre":"208","vo ":"209"," sm":"210"," \u0161t":"211","dan":"212","e z":"213","i t":"214","io ":"215","ist":"216","kon":"217","lo ":"218","stv":"219","u s":"220","uje":"221","ust":"222","\u0107e ":"223","\u0107i ":"224","\u0161to":"225"," dr":"226"," im":"227"," li":"228","ada":"229","aft":"230","ani":"231","ao ":"232","ars":"233","ata":"234","e t":"235","emo":"236","i k":"237","ine":"238","jem":"239","kov":"240","lik":"241","lji":"242","mje":"243","naf":"244","ner":"245","nih":"246","nja":"247","ogo":"248","oiz":"249","ome":"250","pot":"251","ran":"252","ri ":"253","roi":"254","rtk":"255","ska":"256","ter":"257","u i":"258","u o":"259","vi ":"260","vrt":"261"," me":"262"," ug":"263","ak ":"264","ama":"265","dr\u017e":"266","e e":"267","e g":"268","e m":"269","em ":"270","eme":"271","enj":"272","ent":"273","er ":"274","ere":"275","erg":"276","eur":"277","go ":"278","i b":"279","i z":"280","jet":"281","ksi":"282","o u":"283","oda":"284","ona":"285","pra":"286","reb":"287","rem":"288","rop":"289","tri":"290","\u017eav":"291"," ci":"292"," eu":"293"," re":"294"," te":"295"," uv":"296"," ve":"297","aju":"298","an ":"299"},"czech":{" pr":"0"," po":"1","n\u00ed ":"2","pro":"3"," na":"4","na ":"5"," p\u0159":"6","ch ":"7"," je":"8"," ne":"9","\u017ee ":"10"," \u017ee":"11"," se":"12"," do":"13"," ro":"14"," st":"15"," v ":"16"," ve":"17","p\u0159e":"18","se ":"19","ho ":"20","sta":"21"," to":"22"," vy":"23"," za":"24","ou ":"25"," a ":"26","to ":"27"," by":"28","la ":"29","ce ":"30","e v":"31","ist":"32","le ":"33","pod":"34","\u00ed p":"35"," vl":"36","e n":"37","e s":"38","je ":"39","k\u00e9 ":"40","by ":"41","em ":"42","\u00fdch":"43"," od":"44","ova":"45","\u0159ed":"46","dy ":"47","en\u00ed":"48","kon":"49","li ":"50","n\u011b ":"51","str":"52"," z\u00e1":"53","ve ":"54"," ka":"55"," sv":"56","e p":"57","it ":"58","l\u00e1d":"59","oho":"60","rov":"61","roz":"62","ter":"63","vl\u00e1":"64","\u00edm ":"65"," ko":"66","hod":"67","nis":"68","p\u0159\u00ed":"69","sk\u00fd":"70"," mi":"71"," ob":"72"," so":"73","a p":"74","ali":"75","bud":"76","edn":"77","ick":"78","kte":"79","ku ":"80","o s":"81","al ":"82","ci ":"83","e t":"84","il ":"85","ny ":"86","n\u00e9 ":"87","odl":"88","ov\u00e1":"89","rot":"90","sou":"91","\u00e1n\u00ed":"92"," bu":"93"," mo":"94"," o ":"95","ast":"96","byl":"97","de ":"98","ek ":"99","ost":"100"," m\u00ed":"101"," ta":"102","es ":"103","jed":"104","ky ":"105","las":"106","m p":"107","nes":"108","n\u00edm":"109","ran":"110","rem":"111","ros":"112","\u00e9ho":"113"," de":"114"," kt":"115"," ni":"116"," si":"117"," v\u00fd":"118","at ":"119","j\u00ed ":"120","k\u00fd ":"121","mi ":"122","pre":"123","tak":"124","tan":"125","y v":"126","\u0159ek":"127"," ch":"128"," li":"129"," n\u00e1":"130"," pa":"131"," \u0159e":"132","da ":"133","dle":"134","dne":"135","i p":"136","i v":"137","ly ":"138","min":"139","o n":"140","o v":"141","pol":"142","tra":"143","val":"144","vn\u00ed":"145","\u00edch":"146","\u00fd p":"147","\u0159ej":"148"," ce":"149"," kd":"150"," le":"151","a s":"152","a z":"153","cen":"154","e k":"155","eds":"156","ekl":"157","emi":"158","kl ":"159","lat":"160","lo ":"161","mi\u00e9":"162","nov":"163","pra":"164","sku":"165","sk\u00e9":"166","sti":"167","tav":"168","ti ":"169","ty ":"170","v\u00e1n":"171","v\u00e9 ":"172","y n":"173","y s":"174","\u00ed s":"175","\u00ed v":"176","\u011b p":"177"," dn":"178"," n\u011b":"179"," sp":"180"," \u010ds":"181","a n":"182","a t":"183","ak ":"184","dn\u00ed":"185","doh":"186","e b":"187","e m":"188","ejn":"189","ena":"190","est":"191","ini":"192","m z":"193","nal":"194","nou":"195","n\u00e1 ":"196","ovi":"197","ov\u00e9":"198","ov\u00fd":"199","rsk":"200","st\u00e1":"201","t\u00ed ":"202","t\u0159e":"203","t\u016f ":"204","ude":"205","za ":"206","\u00e9 p":"207","\u00e9m ":"208","\u00ed d":"209"," ir":"210"," zv":"211","ale":"212","an\u011b":"213","ave":"214","ck\u00e9":"215","den":"216","e z":"217","ech":"218","en ":"219","er\u00fd":"220","hla":"221","i s":"222","i\u00e9r":"223","lov":"224","mu ":"225","neb":"226","nic":"227","o b":"228","o m":"229","pad":"230","pot":"231","rav":"232","rop":"233","r\u00fd ":"234","sed":"235","si ":"236","t p":"237","tic":"238","tu ":"239","t\u011b ":"240","u p":"241","u v":"242","v\u00e1 ":"243","v\u00fd\u0161":"244","zv\u00fd":"245","\u010dn\u00ed":"246","\u0159\u00ed ":"247","\u016fm ":"248"," bl":"249"," br":"250"," ho":"251"," ja":"252"," re":"253"," s ":"254"," z ":"255"," zd":"256","a v":"257","ani":"258","ato":"259","bla":"260","bri":"261","e\u010dn":"262","e\u0159e":"263","h v":"264","i n":"265","ie ":"266","ila":"267","irs":"268","ite":"269","kov":"270","nos":"271","o o":"272","o p":"273","oce":"274","ody":"275","ohl":"276","oli":"277","ovo":"278","pla":"279","po\u010d":"280","pr\u00e1":"281","ra ":"282","rit":"283","rod":"284","ry ":"285","sd ":"286","sko":"287","ssd":"288","tel":"289","u s":"290","vat":"291","ve\u0159":"292","vit":"293","vla":"294","y p":"295","\u00e1ln":"296","\u010dss":"297","\u0161en":"298"," al":"299"},"danish":{"er ":"0","en ":"1"," de":"2","et ":"3","der":"4","de ":"5","for":"6"," fo":"7"," i ":"8","at ":"9"," at":"10","re ":"11","det":"12"," ha":"13","nde":"14","ere":"15","ing":"16","den":"17"," me":"18"," og":"19","ger":"20","ter":"21"," er":"22"," si":"23","and":"24"," af":"25","or ":"26"," st":"27"," ti":"28"," en":"29","og ":"30","ar ":"31","il ":"32","r s":"33","ige":"34","til":"35","ke ":"36","r e":"37","af ":"38","kke":"39"," ma":"40"," p\u00e5":"41","om ":"42","p\u00e5 ":"43","ed ":"44","ge ":"45","end":"46","nge":"47","t s":"48","e s":"49","ler":"50"," sk":"51","els":"52","ern":"53","sig":"54","ne ":"55","lig":"56","r d":"57","ska":"58"," vi":"59","har":"60"," be":"61"," se":"62","an ":"63","ikk":"64","lle":"65","gen":"66","n f":"67","ste":"68","t a":"69","t d":"70","rin":"71"," ik":"72","es ":"73","ng ":"74","ver":"75","r b":"76","sen":"77","ede":"78","men":"79","r i":"80"," he":"81"," et":"82","ig ":"83","lan":"84","med":"85","nd ":"86","rne":"87"," da":"88"," in":"89","e t":"90","mme":"91","und":"92"," om":"93","e e":"94","e m":"95","her":"96","le ":"97","r f":"98","t f":"99","s\u00e5 ":"100","te ":"101"," so":"102","ele":"103","t e":"104"," ko":"105","est":"106","ske":"107"," bl":"108","e f":"109","ekt":"110","mar":"111","bru":"112","e a":"113","el ":"114","ers":"115","ret":"116","som":"117","tte":"118","ve ":"119"," la":"120"," ud":"121"," ve":"122","age":"123","e d":"124","e h":"125","lse":"126","man":"127","rug":"128","sel":"129","ser":"130"," fi":"131"," op":"132"," pr":"133","dt ":"134","e i":"135","n m":"136","r m":"137"," an":"138"," re":"139"," sa":"140","ion":"141","ner":"142","res":"143","t i":"144","get":"145","n s":"146","one":"147","orb":"148","t h":"149","vis":"150","\u00e5r ":"151"," fr":"152","bil":"153","e k":"154","ens":"155","ind":"156","omm":"157","t m":"158"," hv":"159"," je":"160","dan":"161","ent":"162","fte":"163","nin":"164"," mi":"165","e o":"166","e p":"167","n o":"168","nte":"169"," ku":"170","ell":"171","nas":"172","ore":"173","r h":"174","r k":"175","sta":"176","sto":"177","dag":"178","eri":"179","kun":"180","lde":"181","mer":"182","r a":"183","r v":"184","rek":"185","rer":"186","t o":"187","tor":"188","t\u00f8r":"189"," f\u00e5":"190"," m\u00e5":"191"," to":"192","boe":"193","che":"194","e v":"195","i d":"196","ive":"197","kab":"198","ns ":"199","oel":"200","se ":"201","t v":"202"," al":"203"," bo":"204"," un":"205","ans":"206","dre":"207","ire":"208","k\u00f8b":"209","ors":"210","ove":"211","ren":"212","t b":"213","\u00f8r ":"214"," ka":"215","ald":"216","bet":"217","gt ":"218","isk":"219","kal":"220","kom":"221","lev":"222","n d":"223","n i":"224","pri":"225","r p":"226","rbr":"227","s\u00f8g":"228","tel":"229"," s\u00e5":"230"," te":"231"," va":"232","al ":"233","dir":"234","eje":"235","fis":"236","gs\u00e5":"237","isc":"238","jer":"239","ker":"240","ogs":"241","sch":"242","st ":"243","t k":"244","uge":"245"," di":"246","ag ":"247","d a":"248","g i":"249","ill":"250","l a":"251","lsk":"252","n a":"253","on ":"254","sam":"255","str":"256","tet":"257","var":"258"," mo":"259","art":"260","ash":"261","att":"262","e b":"263","han":"264","hav":"265","kla":"266","kon":"267","n t":"268","ned":"269","r o":"270","ra ":"271","rre":"272","ves":"273","vil":"274"," el":"275"," kr":"276"," ov":"277","ann":"278","e u":"279","ess":"280","fra":"281","g a":"282","g d":"283","int":"284","ngs":"285","rde":"286","tra":"287"," \u00e5r":"288","akt":"289","asi":"290","em ":"291","gel":"292","gym":"293","hol":"294","kan":"295","mna":"296","n h":"297","nsk":"298","old":"299"},"dutch":{"en ":"0","de ":"1"," de":"2","et ":"3","an ":"4"," he":"5","er ":"6"," va":"7","n d":"8","van":"9","een":"10","het":"11"," ge":"12","oor":"13"," ee":"14","der":"15"," en":"16","ij ":"17","aar":"18","gen":"19","te ":"20","ver":"21"," in":"22"," me":"23","aan":"24","den":"25"," we":"26","at ":"27","in ":"28"," da":"29"," te":"30","eer":"31","nde":"32","ter":"33","ste":"34","n v":"35"," vo":"36"," zi":"37","ing":"38","n h":"39","voo":"40","is ":"41"," op":"42","tie":"43"," aa":"44","ede":"45","erd":"46","ers":"47"," be":"48","eme":"49","ten":"50","ken":"51","n e":"52"," ni":"53"," ve":"54","ent":"55","ijn":"56","jn ":"57","mee":"58","iet":"59","n w":"60","ng ":"61","nie":"62"," is":"63","cht":"64","dat":"65","ere":"66","ie ":"67","ijk":"68","n b":"69","rde":"70","ar ":"71","e b":"72","e a":"73","met":"74","t d":"75","el ":"76","ond":"77","t h":"78"," al":"79","e w":"80","op ":"81","ren":"82"," di":"83"," on":"84","al ":"85","and":"86","bij":"87","zij":"88"," bi":"89"," hi":"90"," wi":"91","or ":"92","r d":"93","t v":"94"," wa":"95","e h":"96","lle":"97","rt ":"98","ang":"99","hij":"100","men":"101","n a":"102","n z":"103","rs ":"104"," om":"105","e o":"106","e v":"107","end":"108","est":"109","n t":"110","par":"111"," pa":"112"," pr":"113"," ze":"114","e g":"115","e p":"116","n p":"117","ord":"118","oud":"119","raa":"120","sch":"121","t e":"122","ege":"123","ich":"124","ien":"125","aat":"126","ek ":"127","len":"128","n m":"129","nge":"130","nt ":"131","ove":"132","rd ":"133","wer":"134"," ma":"135"," mi":"136","daa":"137","e k":"138","lij":"139","mer":"140","n g":"141","n o":"142","om ":"143","sen":"144","t b":"145","wij":"146"," ho":"147","e m":"148","ele":"149","gem":"150","heb":"151","pen":"152","ude":"153"," bo":"154"," ja":"155","die":"156","e e":"157","eli":"158","erk":"159","le ":"160","pro":"161","rij":"162"," er":"163"," za":"164","e d":"165","ens":"166","ind":"167","ke ":"168","n k":"169","nd ":"170","nen":"171","nte":"172","r h":"173","s d":"174","s e":"175","t z":"176"," b ":"177"," co":"178"," ik":"179"," ko":"180"," ov":"181","eke":"182","hou":"183","ik ":"184","iti":"185","lan":"186","ns ":"187","t g":"188","t m":"189"," do":"190"," le":"191"," zo":"192","ams":"193","e z":"194","g v":"195","it ":"196","je ":"197","ls ":"198","maa":"199","n i":"200","nke":"201","rke":"202","uit":"203"," ha":"204"," ka":"205"," mo":"206"," re":"207"," st":"208"," to":"209","age":"210","als":"211","ark":"212","art":"213","ben":"214","e r":"215","e s":"216","ert":"217","eze":"218","ht ":"219","ijd":"220","lem":"221","r v":"222","rte":"223","t p":"224","zeg":"225","zic":"226","aak":"227","aal":"228","ag ":"229","ale":"230","bbe":"231","ch ":"232","e t":"233","ebb":"234","erz":"235","ft ":"236","ge ":"237","led":"238","mst":"239","n n":"240","oek":"241","r i":"242","t o":"243","t w":"244","tel":"245","tte":"246","uur":"247","we ":"248","zit":"249"," af":"250"," li":"251"," ui":"252","ak ":"253","all":"254","aut":"255","doo":"256","e i":"257","ene":"258","erg":"259","ete":"260","ges":"261","hee":"262","jaa":"263","jke":"264","kee":"265","kel":"266","kom":"267","lee":"268","moe":"269","n s":"270","ort":"271","rec":"272","s o":"273","s v":"274","teg":"275","tij":"276","ven":"277","waa":"278","wel":"279"," an":"280"," au":"281"," bu":"282"," gr":"283"," pl":"284"," ti":"285","'' ":"286","ade":"287","dag":"288","e l":"289","ech":"290","eel":"291","eft":"292","ger":"293","gt ":"294","ig ":"295","itt":"296","j d":"297","ppe":"298","rda":"299"},"english":{" th":"0","the":"1","he ":"2","ed ":"3"," to":"4"," in":"5","er ":"6","ing":"7","ng ":"8"," an":"9","nd ":"10"," of":"11","and":"12","to ":"13","of ":"14"," co":"15","at ":"16","on ":"17","in ":"18"," a ":"19","d t":"20"," he":"21","e t":"22","ion":"23","es ":"24"," re":"25","re ":"26","hat":"27"," sa":"28"," st":"29"," ha":"30","her":"31","tha":"32","tio":"33","or ":"34"," ''":"35","en ":"36"," wh":"37","e s":"38","ent":"39","n t":"40","s a":"41","as ":"42","for":"43","is ":"44","t t":"45"," be":"46","ld ":"47","e a":"48","rs ":"49"," wa":"50","ut ":"51","ve ":"52","ll ":"53","al ":"54"," ma":"55","e i":"56"," fo":"57","'s ":"58","an ":"59","est":"60"," hi":"61"," mo":"62"," se":"63"," pr":"64","s t":"65","ate":"66","st ":"67","ter":"68","ere":"69","ted":"70","nt ":"71","ver":"72","d a":"73"," wi":"74","se ":"75","e c":"76","ect":"77","ns ":"78"," on":"79","ly ":"80","tol":"81","ey ":"82","r t":"83"," ca":"84","ati":"85","ts ":"86","all":"87"," no":"88","his":"89","s o":"90","ers":"91","con":"92","e o":"93","ear":"94","f t":"95","e w":"96","was":"97","ons":"98","sta":"99","'' ":"100","sti":"101","n a":"102","sto":"103","t h":"104"," we":"105","id ":"106","th ":"107"," it":"108","ce ":"109"," di":"110","ave":"111","d h":"112","cou":"113","pro":"114","ad ":"115","oll":"116","ry ":"117","d s":"118","e m":"119"," so":"120","ill":"121","cti":"122","te ":"123","tor":"124","eve":"125","g t":"126","it ":"127"," ch":"128"," de":"129","hav":"130","oul":"131","ty ":"132","uld":"133","use":"134"," al":"135","are":"136","ch ":"137","me ":"138","out":"139","ove":"140","wit":"141","ys ":"142","chi":"143","t a":"144","ith":"145","oth":"146"," ab":"147"," te":"148"," wo":"149","s s":"150","res":"151","t w":"152","tin":"153","e b":"154","e h":"155","nce":"156","t s":"157","y t":"158","e p":"159","ele":"160","hin":"161","s i":"162","nte":"163"," li":"164","le ":"165"," do":"166","aid":"167","hey":"168","ne ":"169","s w":"170"," as":"171"," fr":"172"," tr":"173","end":"174","sai":"175"," el":"176"," ne":"177"," su":"178","'t ":"179","ay ":"180","hou":"181","ive":"182","lec":"183","n't":"184"," ye":"185","but":"186","d o":"187","o t":"188","y o":"189"," ho":"190"," me":"191","be ":"192","cal":"193","e e":"194","had":"195","ple":"196"," at":"197"," bu":"198"," la":"199","d b":"200","s h":"201","say":"202","t i":"203"," ar":"204","e f":"205","ght":"206","hil":"207","igh":"208","int":"209","not":"210","ren":"211"," is":"212"," pa":"213"," sh":"214","ays":"215","com":"216","n s":"217","r a":"218","rin":"219","y a":"220"," un":"221","n c":"222","om ":"223","thi":"224"," mi":"225","by ":"226","d i":"227","e d":"228","e n":"229","t o":"230"," by":"231","e r":"232","eri":"233","old":"234","ome":"235","whe":"236","yea":"237"," gr":"238","ar ":"239","ity":"240","mpl":"241","oun":"242","one":"243","ow ":"244","r s":"245","s f":"246","tat":"247"," ba":"248"," vo":"249","bou":"250","sam":"251","tim":"252","vot":"253","abo":"254","ant":"255","ds ":"256","ial":"257","ine":"258","man":"259","men":"260"," or":"261"," po":"262","amp":"263","can":"264","der":"265","e l":"266","les":"267","ny ":"268","ot ":"269","rec":"270","tes":"271","tho":"272","ica":"273","ild":"274","ir ":"275","nde":"276","ose":"277","ous":"278","pre":"279","ste":"280","era":"281","per":"282","r o":"283","red":"284","rie":"285"," bo":"286"," le":"287","ali":"288","ars":"289","ore":"290","ric":"291","s m":"292","str":"293"," fa":"294","ess":"295","ie ":"296","ist":"297","lat":"298","uri":"299"},"estonian":{"st ":"0"," ka":"1","on ":"2","ja ":"3"," va":"4"," on":"5"," ja":"6"," ko":"7","se ":"8","ast":"9","le ":"10","es ":"11","as ":"12","is ":"13","ud ":"14"," sa":"15","da ":"16","ga ":"17"," ta":"18","aja":"19","sta":"20"," ku":"21"," pe":"22","a k":"23","est":"24","ist":"25","ks ":"26","ta ":"27","al ":"28","ava":"29","id ":"30","saa":"31","mis":"32","te ":"33","val":"34"," et":"35","nud":"36"," te":"37","inn":"38"," se":"39"," tu":"40","a v":"41","alu":"42","e k":"43","ise":"44","lu ":"45","ma ":"46","mes":"47"," mi":"48","et ":"49","iku":"50","lin":"51","ad ":"52","el ":"53","ime":"54","ne ":"55","nna":"56"," ha":"57"," in":"58"," ke":"59"," v\u00f5":"60","a s":"61","a t":"62","ab ":"63","e s":"64","esi":"65"," la":"66"," li":"67","e v":"68","eks":"69","ema":"70","las":"71","les":"72","rju":"73","tle":"74","tsi":"75","tus":"76","upa":"77","use":"78","ust":"79","var":"80"," l\u00e4":"81","ali":"82","arj":"83","de ":"84","ete":"85","i t":"86","iga":"87","ilm":"88","kui":"89","li ":"90","tul":"91"," ei":"92"," me":"93"," s\u00f5":"94","aal":"95","ata":"96","dus":"97","ei ":"98","nik":"99","pea":"100","s k":"101","s o":"102","sal":"103","s\u00f5n":"104","ter":"105","ul ":"106","v\u00f5i":"107"," el":"108"," ne":"109","a j":"110","ate":"111","end":"112","i k":"113","ita":"114","kar":"115","kor":"116","l o":"117","lt ":"118","maa":"119","oli":"120","sti":"121","vad":"122","\u00e4\u00e4n":"123"," ju":"124"," j\u00e4":"125"," k\u00fc":"126"," ma":"127"," po":"128"," \u00fct":"129","aas":"130","aks":"131","at ":"132","ed ":"133","eri":"134","hoi":"135","i s":"136","ka ":"137","la ":"138","nni":"139","oid":"140","pai":"141","rit":"142","us ":"143","\u00fctl":"144"," aa":"145"," lo":"146"," to":"147"," ve":"148","a e":"149","ada":"150","aid":"151","ami":"152","and":"153","dla":"154","e j":"155","ega":"156","gi ":"157","gu ":"158","i p":"159","idl":"160","ik ":"161","ini":"162","jup":"163","kal":"164","kas":"165","kes":"166","koh":"167","s e":"168","s p":"169","sel":"170","sse":"171","ui ":"172"," pi":"173"," si":"174","aru":"175","eda":"176","eva":"177","fil":"178","i v":"179","ida":"180","ing":"181","l\u00e4\u00e4":"182","me ":"183","na ":"184","nda":"185","nim":"186","ole":"187","ots":"188","ris":"189","s l":"190","sia":"191","t p":"192"," en":"193"," mu":"194"," ol":"195"," p\u00f5":"196"," su":"197"," v\u00e4":"198"," \u00fch":"199","a l":"200","a p":"201","aga":"202","ale":"203","aps":"204","arv":"205","e a":"206","ela":"207","ika":"208","lle":"209","loo":"210","mal":"211","pet":"212","t k":"213","tee":"214","tis":"215","vat":"216","\u00e4ne":"217","\u00f5nn":"218"," es":"219"," fi":"220"," vi":"221","a i":"222","a o":"223","aab":"224","aap":"225","ala":"226","alt":"227","ama":"228","anu":"229","e p":"230","e t":"231","eal":"232","eli":"233","haa":"234","hin":"235","iva":"236","kon":"237","ku ":"238","lik":"239","lm ":"240","min":"241","n t":"242","odu":"243","oon":"244","psa":"245","ri ":"246","si ":"247","stu":"248","t e":"249","t s":"250","ti ":"251","ule":"252","uur":"253","vas":"254","vee":"255"," ki":"256"," ni":"257"," n\u00e4":"258"," ra":"259","aig":"260","aka":"261","all":"262","atu":"263","e e":"264","eis":"265","ers":"266","i e":"267","ii ":"268","iis":"269","il ":"270","ima":"271","its":"272","kka":"273","kuh":"274","l k":"275","lat":"276","maj":"277","ndu":"278","ni ":"279","nii":"280","oma":"281","ool":"282","rso":"283","ru ":"284","rva":"285","s t":"286","sek":"287","son":"288","ste":"289","t m":"290","taj":"291","tam":"292","ude":"293","uho":"294","vai":"295"," ag":"296"," os":"297"," pa":"298"," re":"299"},"farsi":{"\u0627\u0646 ":"0","\u0627\u06cc ":"1","\u0647 \u0627":"2"," \u0627\u064a":"3"," \u062f\u0631":"4","\u0628\u0647 ":"5"," \u0628\u0631":"6","\u062f\u0631 ":"7","\u0631\u0627\u0646":"8"," \u0628\u0647":"9","\u06cc \u0627":"10","\u0627\u0632 ":"11","\u064a\u0646 ":"12","\u0645\u06cc ":"13"," \u0627\u0632":"14","\u062f\u0647 ":"15","\u0633\u062a ":"16","\u0627\u0633\u062a":"17"," \u0627\u0633":"18"," \u06a9\u0647":"19","\u06a9\u0647 ":"20","\u0627\u064a\u0631":"21","\u0646\u062f ":"22","\u0627\u064a\u0646":"23"," \u0647\u0627":"24","\u064a\u0631\u0627":"25","\u0648\u062f ":"26"," \u0631\u0627":"27","\u0647\u0627\u06cc":"28"," \u062e\u0648":"29","\u062a\u0647 ":"30","\u0631\u0627 ":"31","\u0631\u0627\u06cc":"32","\u0631\u062f ":"33","\u0646 \u0628":"34","\u06a9\u0631\u062f":"35"," \u0648 ":"36"," \u06a9\u0631":"37","\u0627\u062a ":"38","\u0628\u0631\u0627":"39","\u062f \u06a9":"40","\u0645\u0627\u0646":"41","\u06cc \u062f":"42"," \u0627\u0646":"43","\u062e\u0648\u0627":"44","\u0634\u0648\u0631":"45"," \u0628\u0627":"46","\u0646 \u0627":"47"," \u0633\u0627":"48","\u062a\u0645\u06cc":"49","\u0631\u06cc ":"50","\u0627\u062a\u0645":"51","\u0627 \u0627":"52","\u0648\u0627\u0647":"53"," \u0627\u062a":"54"," \u0639\u0631":"55","\u0627\u0642 ":"56","\u0631 \u0645":"57","\u0631\u0627\u0642":"58","\u0639\u0631\u0627":"59","\u06cc \u0628":"60"," \u062a\u0627":"61"," \u062a\u0648":"62","\u0627\u0631 ":"63","\u0631 \u0627":"64","\u0646 \u0645":"65","\u0647 \u0628":"66","\u0648\u0631 ":"67","\u064a\u062f ":"68","\u06cc \u06a9":"69"," \u0627\u0645":"70"," \u062f\u0627":"71"," \u06a9\u0646":"72","\u0627\u0647\u062f":"73","\u0647\u062f ":"74"," \u0622\u0646":"75"," \u0645\u06cc":"76"," \u0646\u064a":"77"," \u06af\u0641":"78","\u062f \u0627":"79","\u06af\u0641\u062a":"80"," \u06a9\u0634":"81","\u0627 \u0628":"82","\u0646\u06cc ":"83","\u0647\u0627 ":"84","\u06a9\u0634\u0648":"85"," \u0631\u0648":"86","\u062a \u06a9":"87","\u0646\u064a\u0648":"88","\u0647 \u0645":"89","\u0648\u06cc ":"90","\u06cc \u062a":"91"," \u0634\u0648":"92","\u0627\u0644 ":"93","\u062f\u0627\u0631":"94","\u0645\u0647 ":"95","\u0646 \u06a9":"96","\u0647 \u062f":"97","\u064a\u0647 ":"98"," \u0645\u0627":"99","\u0627\u0645\u0647":"100","\u062f \u0628":"101","\u0632\u0627\u0631":"102","\u0648\u0631\u0627":"103","\u06af\u0632\u0627":"104"," \u067e\u064a":"105","\u0622\u0646 ":"106","\u0627\u0646\u062a":"107","\u062a \u0627":"108","\u0641\u062a ":"109","\u0647 \u0646":"110","\u06cc \u062e":"111","\u0627\u0645\u0627":"112","\u0628\u0627\u062a":"113","\u0645\u0627 ":"114","\u0645\u0644\u0644":"115","\u0646\u0627\u0645":"116","\u064a\u0631 ":"117","\u06cc \u0645":"118","\u06cc \u0647":"119"," \u0622\u0645":"120"," \u0627\u06cc":"121"," \u0645\u0646":"122","\u0627\u0646\u0633":"123","\u0627\u0646\u064a":"124","\u062a \u062f":"125","\u0631\u062f\u0647":"126","\u0633\u0627\u0632":"127","\u0646 \u062f":"128","\u0646\u0647 ":"129","\u0648\u0631\u062f":"130"," \u0627\u0648":"131"," \u0628\u064a":"132"," \u0633\u0648":"133"," \u0634\u062f":"134","\u0627\u062f\u0647":"135","\u0627\u0646\u062f":"136","\u0628\u0627 ":"137","\u062a \u0628":"138","\u0631 \u0628":"139","\u0632 \u0627":"140","\u0632\u0645\u0627":"141","\u0633\u062a\u0647":"142","\u0646 \u0631":"143","\u0647 \u0633":"144","\u0648\u0627\u0646":"145","\u0648\u0632 ":"146","\u06cc \u0631":"147","\u06cc \u0633":"148"," \u0647\u0633":"149","\u0627\u0628\u0627":"150","\u0627\u0645 ":"151","\u0627\u0648\u0631":"152","\u062a\u062e\u0627":"153","\u062e\u0627\u0628":"154","\u062e\u0648\u062f":"155","\u062f \u062f":"156","\u062f\u0646 ":"157","\u0631\u0647\u0627":"158","\u0631\u0648\u0632":"159","\u0631\u06af\u0632":"160","\u0646\u062a\u062e":"161","\u0647 \u0634":"162","\u0647 \u0647":"163","\u0647\u0633\u062a":"164","\u064a\u062a ":"165","\u064a\u0645 ":"166"," \u062f\u0648":"167"," \u062f\u064a":"168"," \u0645\u0648":"169"," \u0646\u0648":"170"," \u0647\u0645":"171"," \u06a9\u0627":"172","\u0627\u062f ":"173","\u0627\u0631\u06cc":"174","\u0627\u0646\u06cc":"175","\u0628\u0631 ":"176","\u0628\u0648\u062f":"177","\u062a \u0647":"178","\u062d \u0647":"179","\u062d\u0627\u0644":"180","\u0631\u0634 ":"181","\u0639\u0647 ":"182","\u0644\u06cc ":"183","\u0648\u0645 ":"184","\u0698\u0627\u0646":"185"," \u0633\u0644":"186","\u0622\u0645\u0631":"187","\u0627\u062d ":"188","\u062a\u0648\u0633":"189","\u062f\u0627\u062f":"190","\u062f\u0627\u0645":"191","\u0631 \u062f":"192","\u0631\u0647 ":"193","\u0631\u064a\u06a9":"194","\u0632\u06cc ":"195","\u0633\u0644\u0627":"196","\u0634\u0648\u062f":"197","\u0644\u0627\u062d":"198","\u0645\u0631\u064a":"199","\u0646\u0646\u062f":"200","\u0647 \u0639":"201","\u064a\u0645\u0627":"202","\u064a\u06a9\u0627":"203","\u067e\u064a\u0645":"204","\u06af\u0631 ":"205"," \u0622\u0698":"206"," \u0627\u0644":"207"," \u0628\u0648":"208"," \u0645\u0642":"209"," \u0645\u0644":"210"," \u0648\u06cc":"211","\u0622\u0698\u0627":"212","\u0627\u0632\u0645":"213","\u0627\u0632\u06cc":"214","\u0628\u0627\u0631":"215","\u0628\u0631\u0646":"216","\u0631 \u0622":"217","\u0632 \u0633":"218","\u0633\u0639\u0647":"219","\u0634\u062a\u0647":"220","\u0645\u0627\u062a":"221","\u0646 \u0622":"222","\u0646 \u067e":"223","\u0646\u0633 ":"224","\u0647 \u06af":"225","\u0648\u0633\u0639":"226","\u064a\u0627\u0646":"227","\u064a\u0648\u0645":"228","\u06a9\u0627 ":"229","\u06a9\u0627\u0645":"230","\u06a9\u0646\u062f":"231"," \u062e\u0627":"232"," \u0633\u0631":"233","\u0622\u0648\u0631":"234","\u0627\u0631\u062f":"235","\u0627\u0642\u062f":"236","\u0627\u064a\u0645":"237","\u0627\u064a\u06cc":"238","\u0628\u0631\u06af":"239","\u062a \u0639":"240","\u062a\u0646 ":"241","\u062e\u062a ":"242","\u062f \u0648":"243","\u0631 \u062e":"244","\u0631\u06a9 ":"245","\u0632\u064a\u0631":"246","\u0641\u062a\u0647":"247","\u0642\u062f\u0627":"248","\u0644 \u062a":"249","\u0645\u064a\u0646":"250","\u0646 \u06af":"251","\u0647 \u0622":"252","\u0647 \u062e":"253","\u0647 \u06a9":"254","\u0648\u0631\u06a9":"255","\u0648\u064a\u0648":"256","\u064a\u0648\u0631":"257","\u064a\u0648\u064a":"258","\u064a\u06cc ":"259","\u06a9 \u062a":"260","\u06cc \u0634":"261"," \u0627\u0642":"262"," \u062d\u0627":"263"," \u062d\u0642":"264"," \u062f\u0633":"265"," \u0634\u06a9":"266"," \u0639\u0645":"267"," \u064a\u06a9":"268","\u0627 \u062a":"269","\u0627 \u062f":"270","\u0627\u0631\u062c":"271","\u0628\u064a\u0646":"272","\u062a \u0645":"273","\u062a \u0648":"274","\u062a\u0627\u064a":"275","\u062f\u0633\u062a":"276","\u0631 \u062d":"277","\u0631 \u0633":"278","\u0631\u0646\u0627":"279","\u0632 \u0628":"280","\u0634\u06a9\u0627":"281","\u0644\u0644 ":"282","\u0645 \u06a9":"283","\u0645\u0632 ":"284","\u0646\u062f\u0627":"285","\u0646\u0648\u0627":"286","\u0648 \u0627":"287","\u0648\u0631\u0647":"288","\u0648\u0646 ":"289","\u0648\u0646\u062f":"290","\u064a\u0645\u0632":"291"," \u0622\u0648":"292"," \u0627\u0639":"293"," \u0641\u0631":"294"," \u0645\u062a":"295"," \u0646\u0647":"296"," \u0647\u0631":"297"," \u0648\u0632":"298"," \u06af\u0632":"299"},"finnish":{"en ":"0","in ":"1","an ":"2","on ":"3","ist":"4","ta ":"5","ja ":"6","n t":"7","sa ":"8","sta":"9","aan":"10","n p":"11"," on":"12","ssa":"13","tta":"14","t\u00e4 ":"15"," ka":"16"," pa":"17","si ":"18"," ja":"19","n k":"20","lla":"21","\u00e4n ":"22","een":"23","n v":"24","ksi":"25","ett":"26","nen":"27","taa":"28","tt\u00e4":"29"," va":"30","ill":"31","itt":"32"," jo":"33"," ko":"34","n s":"35"," tu":"36","ia ":"37"," su":"38","a p":"39","aa ":"40","la ":"41","lle":"42","n m":"43","le ":"44","tte":"45","na ":"46"," ta":"47"," ve":"48","at ":"49"," vi":"50","utt":"51"," sa":"52","ise":"53","sen":"54"," ku":"55"," n\u00e4":"56"," p\u00e4":"57","ste":"58"," ol":"59","a t":"60","ais":"61","maa":"62","ti ":"63","a o":"64","oit":"65","p\u00e4\u00e4":"66"," pi":"67","a v":"68","ala":"69","ine":"70","isi":"71","tel":"72","tti":"73"," si":"74","a k":"75","all":"76","iin":"77","kin":"78","st\u00e4":"79","uom":"80","vii":"81"," ma":"82"," se":"83","en\u00e4":"84"," mu":"85","a s":"86","est":"87","iss":"88","ll\u00e4":"89","lok":"90","l\u00e4 ":"91","n j":"92","n o":"93","toi":"94","ven":"95","ytt":"96"," li":"97","ain":"98","et ":"99","ina":"100","n a":"101","n n":"102","oll":"103","plo":"104","ten":"105","ust":"106","\u00e4ll":"107","\u00e4\u00e4n":"108"," to":"109","den":"110","men":"111","oki":"112","suo":"113","s\u00e4 ":"114","t\u00e4\u00e4":"115","uks":"116","vat":"117"," al":"118"," ke":"119"," te":"120","a e":"121","lii":"122","tai":"123","tei":"124","\u00e4is":"125","\u00e4\u00e4 ":"126"," pl":"127","ell":"128","i t":"129","ide":"130","ikk":"131","ki ":"132","nta":"133","ova":"134","yst":"135","yt ":"136","\u00e4 p":"137","\u00e4yt":"138"," ha":"139"," pe":"140"," t\u00e4":"141","a n":"142","aik":"143","i p":"144","i v":"145","nyt":"146","n\u00e4y":"147","pal":"148","tee":"149","un ":"150"," me":"151","a m":"152","ess":"153","kau":"154","pai":"155","stu":"156","ut ":"157","voi":"158"," et":"159","a h":"160","eis":"161","hte":"162","i o":"163","iik":"164","ita":"165","jou":"166","mis":"167","nin":"168","nut":"169","sia":"170","ss\u00e4":"171","van":"172"," ty":"173"," yh":"174","aks":"175","ime":"176","loi":"177","me ":"178","n e":"179","n h":"180","n l":"181","oin":"182","ome":"183","ott":"184","ouk":"185","sit":"186","sti":"187","tet":"188","tie":"189","ukk":"190","\u00e4 k":"191"," ra":"192"," ti":"193","aja":"194","asi":"195","ent":"196","iga":"197","iig":"198","ite":"199","jan":"200","kaa":"201","kse":"202","laa":"203","lan":"204","li ":"205","n\u00e4j":"206","ole":"207","tii":"208","usi":"209","\u00e4j\u00e4":"210"," ov":"211","a a":"212","ant":"213","ava":"214","ei ":"215","eri":"216","kan":"217","kku":"218","lai":"219","lis":"220","l\u00e4i":"221","mat":"222","ois":"223","pel":"224","sil":"225","sty":"226","taj":"227","tav":"228","ttu":"229","ty\u00f6":"230","y\u00f6s":"231","\u00e4 o":"232"," ai":"233"," pu":"234","a j":"235","a l":"236","aal":"237","arv":"238","ass":"239","ien":"240","imi":"241","imm":"242","it\u00e4":"243","ka ":"244","kes":"245","kue":"246","lee":"247","lin":"248","llo":"249","one":"250","ri ":"251","t o":"252","t p":"253","tu ":"254","val":"255","vuo":"256"," ei":"257"," he":"258"," hy":"259"," my":"260"," vo":"261","ali":"262","alo":"263","ano":"264","ast":"265","att":"266","auk":"267","eli":"268","ely":"269","hti":"270","ika":"271","ken":"272","kki":"273","lys":"274","min":"275","my\u00f6":"276","oht":"277","oma":"278","tus":"279","umi":"280","yks":"281","\u00e4t ":"282","\u00e4\u00e4l":"283","\u00f6s ":"284"," ar":"285"," eu":"286"," hu":"287"," na":"288","aat":"289","alk":"290","alu":"291","ans":"292","arj":"293","enn":"294","han":"295","kuu":"296","n y":"297","set":"298","sim":"299"},"french":{"es ":"0"," de":"1","de ":"2"," le":"3","ent":"4","le ":"5","nt ":"6","la ":"7","s d":"8"," la":"9","ion":"10","on ":"11","re ":"12"," pa":"13","e l":"14","e d":"15"," l'":"16","e p":"17"," co":"18"," pr":"19","tio":"20","ns ":"21"," en":"22","ne ":"23","que":"24","r l":"25","les":"26","ur ":"27","en ":"28","ati":"29","ue ":"30"," po":"31"," d'":"32","par":"33"," a ":"34","et ":"35","it ":"36"," qu":"37","men":"38","ons":"39","te ":"40"," et":"41","t d":"42"," re":"43","des":"44"," un":"45","ie ":"46","s l":"47"," su":"48","pou":"49"," au":"50"," \u00e0 ":"51","con":"52","er ":"53"," no":"54","ait":"55","e c":"56","se ":"57","t\u00e9 ":"58","du ":"59"," du":"60"," d\u00e9":"61","ce ":"62","e e":"63","is ":"64","n d":"65","s a":"66"," so":"67","e r":"68","e s":"69","our":"70","res":"71","ssi":"72","eur":"73"," se":"74","eme":"75","est":"76","us ":"77","sur":"78","ant":"79","iqu":"80","s p":"81","une":"82","uss":"83","l'a":"84","pro":"85","ter":"86","tre":"87","end":"88","rs ":"89"," ce":"90","e a":"91","t p":"92","un ":"93"," ma":"94"," ru":"95"," r\u00e9":"96","ous":"97","ris":"98","rus":"99","sse":"100","ans":"101","ar ":"102","com":"103","e m":"104","ire":"105","nce":"106","nte":"107","t l":"108"," av":"109"," mo":"110"," te":"111","il ":"112","me ":"113","ont":"114","ten":"115","a p":"116","dan":"117","pas":"118","qui":"119","s e":"120","s s":"121"," in":"122","ist":"123","lle":"124","nou":"125","pr\u00e9":"126","'un":"127","air":"128","d'a":"129","ir ":"130","n e":"131","rop":"132","ts ":"133"," da":"134","a s":"135","as ":"136","au ":"137","den":"138","mai":"139","mis":"140","ori":"141","out":"142","rme":"143","sio":"144","tte":"145","ux ":"146","a d":"147","ien":"148","n a":"149","ntr":"150","omm":"151","ort":"152","ouv":"153","s c":"154","son":"155","tes":"156","ver":"157","\u00e8re":"158"," il":"159"," m ":"160"," sa":"161"," ve":"162","a r":"163","ais":"164","ava":"165","di ":"166","n p":"167","sti":"168","ven":"169"," mi":"170","ain":"171","enc":"172","for":"173","it\u00e9":"174","lar":"175","oir":"176","rem":"177","ren":"178","rro":"179","r\u00e9s":"180","sie":"181","t a":"182","tur":"183"," pe":"184"," to":"185","d'u":"186","ell":"187","err":"188","ers":"189","ide":"190","ine":"191","iss":"192","mes":"193","por":"194","ran":"195","sit":"196","st ":"197","t r":"198","uti":"199","vai":"200","\u00e9 l":"201","\u00e9si":"202"," di":"203"," n'":"204"," \u00e9t":"205","a c":"206","ass":"207","e t":"208","in ":"209","nde":"210","pre":"211","rat":"212","s m":"213","ste":"214","tai":"215","tch":"216","ui ":"217","uro":"218","\u00e8s ":"219"," es":"220"," fo":"221"," tr":"222","'ad":"223","app":"224","aux":"225","e \u00e0":"226","ett":"227","iti":"228","lit":"229","nal":"230","op\u00e9":"231","r d":"232","ra ":"233","rai":"234","ror":"235","s r":"236","tat":"237","ut\u00e9":"238","\u00e0 l":"239"," af":"240","anc":"241","ara":"242","art":"243","bre":"244","ch\u00e9":"245","dre":"246","e f":"247","ens":"248","lem":"249","n r":"250","n t":"251","ndr":"252","nne":"253","onn":"254","pos":"255","s t":"256","tiq":"257","ure":"258"," tu":"259","ale":"260","and":"261","ave":"262","cla":"263","cou":"264","e n":"265","emb":"266","ins":"267","jou":"268","mme":"269","rie":"270","r\u00e8s":"271","sem":"272","str":"273","t i":"274","ues":"275","uni":"276","uve":"277","\u00e9 d":"278","\u00e9e ":"279"," ch":"280"," do":"281"," eu":"282"," fa":"283"," lo":"284"," ne":"285"," ra":"286","arl":"287","att":"288","ec ":"289","ica":"290","l a":"291","l'o":"292","l'\u00e9":"293","mmi":"294","nta":"295","orm":"296","ou ":"297","r u":"298","rle":"299"},"german":{"en ":"0","er ":"1"," de":"2","der":"3","ie ":"4"," di":"5","die":"6","sch":"7","ein":"8","che":"9","ich":"10","den":"11","in ":"12","te ":"13","ch ":"14"," ei":"15","ung":"16","n d":"17","nd ":"18"," be":"19","ver":"20","es ":"21"," zu":"22","eit":"23","gen":"24","und":"25"," un":"26"," au":"27"," in":"28","cht":"29","it ":"30","ten":"31"," da":"32","ent":"33"," ve":"34","and":"35"," ge":"36","ine":"37"," mi":"38","r d":"39","hen":"40","ng ":"41","nde":"42"," vo":"43","e d":"44","ber":"45","men":"46","ei ":"47","mit":"48"," st":"49","ter":"50","ren":"51","t d":"52"," er":"53","ere":"54","n s":"55","ste":"56"," se":"57","e s":"58","ht ":"59","des":"60","ist":"61","ne ":"62","auf":"63","e a":"64","isc":"65","on ":"66","rte":"67"," re":"68"," we":"69","ges":"70","uch":"71"," f\u00fc":"72"," so":"73","bei":"74","e e":"75","nen":"76","r s":"77","ach":"78","f\u00fcr":"79","ier":"80","par":"81","\u00fcr ":"82"," ha":"83","as ":"84","ert":"85"," an":"86"," pa":"87"," sa":"88"," sp":"89"," wi":"90","for":"91","tag":"92","zu ":"93","das":"94","rei":"95","he ":"96","hre":"97","nte":"98","sen":"99","vor":"100"," sc":"101","ech":"102","etz":"103","hei":"104","lan":"105","n a":"106","pd ":"107","st ":"108","sta":"109","ese":"110","lic":"111"," ab":"112"," si":"113","gte":"114"," wa":"115","iti":"116","kei":"117","n e":"118","nge":"119","sei":"120","tra":"121","zen":"122"," im":"123"," la":"124","art":"125","im ":"126","lle":"127","n w":"128","rde":"129","rec":"130","set":"131","str":"132","tei":"133","tte":"134"," ni":"135","e p":"136","ehe":"137","ers":"138","g d":"139","nic":"140","von":"141"," al":"142"," pr":"143","an ":"144","aus":"145","erf":"146","r e":"147","tze":"148","t\u00fcr":"149","uf ":"150","ag ":"151","als":"152","ar ":"153","chs":"154","end":"155","ge ":"156","ige":"157","ion":"158","ls ":"159","n m":"160","ngs":"161","nis":"162","nt ":"163","ord":"164","s s":"165","sse":"166"," t\u00fc":"167","ahl":"168","e b":"169","ede":"170","em ":"171","len":"172","n i":"173","orm":"174","pro":"175","rke":"176","run":"177","s d":"178","wah":"179","wer":"180","\u00fcrk":"181"," me":"182","age":"183","att":"184","ell":"185","est":"186","hat":"187","n b":"188","oll":"189","raf":"190","s a":"191","tsc":"192"," es":"193"," fo":"194"," gr":"195"," ja":"196","abe":"197","auc":"198","ben":"199","e n":"200","ege":"201","lie":"202","n u":"203","r v":"204","re ":"205","rit":"206","sag":"207"," am":"208","agt":"209","ahr":"210","bra":"211","de ":"212","erd":"213","her":"214","ite":"215","le ":"216","n p":"217","n v":"218","or ":"219","rbe":"220","rt ":"221","sic":"222","wie":"223","\u00fcbe":"224"," is":"225"," \u00fcb":"226","cha":"227","chi":"228","e f":"229","e m":"230","eri":"231","ied":"232","mme":"233","ner":"234","r a":"235","sti":"236","t a":"237","t s":"238","tis":"239"," ko":"240","arb":"241","ds ":"242","gan":"243","n z":"244","r f":"245","r w":"246","ran":"247","se ":"248","t i":"249","wei":"250","wir":"251"," br":"252"," np":"253","am ":"254","bes":"255","d d":"256","deu":"257","e g":"258","e k":"259","efo":"260","et ":"261","eut":"262","fen":"263","hse":"264","lte":"265","n r":"266","npd":"267","r b":"268","rhe":"269","t w":"270","tz ":"271"," fr":"272"," ih":"273"," ke":"274"," ma":"275","ame":"276","ang":"277","d s":"278","eil":"279","el ":"280","era":"281","erh":"282","h d":"283","i d":"284","kan":"285","n f":"286","n l":"287","nts":"288","och":"289","rag":"290","rd ":"291","spd":"292","spr":"293","tio":"294"," ar":"295"," en":"296"," ka":"297","ark":"298","ass":"299"},"hausa":{" da":"0","da ":"1","in ":"2","an ":"3","ya ":"4"," wa":"5"," ya":"6","na ":"7","ar ":"8","a d":"9"," ma":"10","wa ":"11","a a":"12","a k":"13","a s":"14"," ta":"15","wan":"16"," a ":"17"," ba":"18"," ka":"19","ta ":"20","a y":"21","n d":"22"," ha":"23"," na":"24"," su":"25"," sa":"26","kin":"27","sa ":"28","ata":"29"," ko":"30","a t":"31","su ":"32"," ga":"33","ai ":"34"," sh":"35","a m":"36","uwa":"37","iya":"38","ma ":"39","a w":"40","asa":"41","yan":"42","ka ":"43","ani":"44","shi":"45","a b":"46","a h":"47","a c":"48","ama":"49","ba ":"50","nan":"51","n a":"52"," mu":"53","ana":"54"," yi":"55","a g":"56"," za":"57","i d":"58"," ku":"59","aka":"60","yi ":"61","n k":"62","ann":"63","ke ":"64","tar":"65"," ci":"66","iki":"67","n s":"68","ko ":"69"," ra":"70","ki ":"71","ne ":"72","a z":"73","mat":"74","hak":"75","nin":"76","e d":"77","nna":"78","uma":"79","nda":"80","a n":"81","ada":"82","cik":"83","ni ":"84","rin":"85","una":"86","ara":"87","kum":"88","akk":"89"," ce":"90"," du":"91","man":"92","n y":"93","nci":"94","sar":"95","aki":"96","awa":"97","ci ":"98","kan":"99","kar":"100","ari":"101","n m":"102","and":"103","hi ":"104","n t":"105","ga ":"106","owa":"107","ash":"108","kam":"109","dan":"110","ewa":"111","nsa":"112","ali":"113","ami":"114"," ab":"115"," do":"116","anc":"117","n r":"118","aya":"119","i n":"120","sun":"121","uka":"122"," al":"123"," ne":"124","a'a":"125","cew":"126","cin":"127","mas":"128","tak":"129","un ":"130","aba":"131","kow":"132","a r":"133","ra ":"134"," ja":"135"," \u0199a":"136","en ":"137","r d":"138","sam":"139","tsa":"140"," ru":"141","ce ":"142","i a":"143","abi":"144","ida":"145","mut":"146","n g":"147","n j":"148","san":"149","a \u0199":"150","har":"151","on ":"152","i m":"153","suk":"154"," ak":"155"," ji":"156","yar":"157","'ya":"158","kwa":"159","min":"160"," 'y":"161","ane":"162","ban":"163","ins":"164","ruw":"165","i k":"166","n h":"167"," ad":"168","ake":"169","n w":"170","sha":"171","utu":"172"," \u01b4a":"173","bay":"174","tan":"175","\u01b4an":"176","bin":"177","duk":"178","e m":"179","n n":"180","oka":"181","yin":"182","\u0257an":"183"," fa":"184","a i":"185","kki":"186","re ":"187","za ":"188","ala":"189","asu":"190","han":"191","i y":"192","mar":"193","ran":"194","\u0199as":"195","add":"196","ars":"197","gab":"198","ira":"199","mma":"200","u d":"201"," ts":"202","abb":"203","abu":"204","aga":"205","gar":"206","n b":"207"," \u0257a":"208","aci":"209","aik":"210","am ":"211","dun":"212","e s":"213","i b":"214","i w":"215","kas":"216","kok":"217","wam":"218"," am":"219","amf":"220","bba":"221","din":"222","fan":"223","gwa":"224","i s":"225","wat":"226","ano":"227","are":"228","dai":"229","iri":"230","ma'":"231"," la":"232","all":"233","dam":"234","ika":"235","mi ":"236","she":"237","tum":"238","uni":"239"," an":"240"," ai":"241"," ke":"242"," ki":"243","dag":"244","mai":"245","mfa":"246","no ":"247","nsu":"248","o d":"249","sak":"250","um ":"251"," bi":"252"," gw":"253"," kw":"254","jam":"255","yya":"256","a j":"257","fa ":"258","uta":"259"," hu":"260","'a ":"261","ans":"262","a\u0257a":"263","dda":"264","hin":"265","niy":"266","r s":"267","bat":"268","dar":"269","gan":"270","i t":"271","nta":"272","oki":"273","omi":"274","sal":"275","a l":"276","kac":"277","lla":"278","wad":"279","war":"280","amm":"281","dom":"282","r m":"283","ras":"284","sai":"285"," lo":"286","ats":"287","hal":"288","kat":"289","li ":"290","lok":"291","n c":"292","nar":"293","tin":"294","afa":"295","bub":"296","i g":"297","isa":"298","mak":"299"},"hawaiian":{" ka":"0","na ":"1"," o ":"2","ka ":"3"," ma":"4"," a ":"5"," la":"6","a i":"7","a m":"8"," i ":"9","la ":"10","ana":"11","ai ":"12","ia ":"13","a o":"14","a k":"15","a h":"16","o k":"17"," ke":"18","a a":"19","i k":"20"," ho":"21"," ia":"22","ua ":"23"," na":"24"," me":"25","e k":"26","e a":"27","au ":"28","ke ":"29","ma ":"30","mai":"31","aku":"32"," ak":"33","ahi":"34"," ha":"35"," ko":"36"," e ":"37","a l":"38"," no":"39","me ":"40","ku ":"41","aka":"42","kan":"43","no ":"44","i a":"45","ho ":"46","ou ":"47"," ai":"48","i o":"49","a p":"50","o l":"51","o a":"52","ama":"53","a n":"54"," an":"55","i m":"56","han":"57","i i":"58","iho":"59","kou":"60","ne ":"61"," ih":"62","o i":"63","iki":"64","ona":"65","hoo":"66","le ":"67","e h":"68"," he":"69","ina":"70"," wa":"71","ea ":"72","ako":"73","u i":"74","kah":"75","oe ":"76","i l":"77","u a":"78"," pa":"79","hoi":"80","e i":"81","era":"82","ko ":"83","u m":"84","kua":"85","mak":"86","oi ":"87","kai":"88","i n":"89","a e":"90","hin":"91","ane":"92"," ol":"93","i h":"94","mea":"95","wah":"96","lak":"97","e m":"98","o n":"99","u l":"100","ika":"101","ki ":"102","a w":"103","mal":"104","hi ":"105","e n":"106","u o":"107","hik":"108"," ku":"109","e l":"110","ele":"111","ra ":"112","ber":"113","ine":"114","abe":"115","ain":"116","ala":"117","lo ":"118"," po":"119","kon":"120"," ab":"121","ole":"122","he ":"123","pau":"124","mah":"125","va ":"126","ela":"127","kau":"128","nak":"129"," oe":"130","kei":"131","oia":"132"," ie":"133","ram":"134"," oi":"135","oa ":"136","eho":"137","hov":"138","ieh":"139","ova":"140"," ua":"141","una":"142","ara":"143","o s":"144","awa":"145","o o":"146","nau":"147","u n":"148","wa ":"149","wai":"150","hel":"151"," ae":"152"," al":"153","ae ":"154","ta ":"155","aik":"156"," hi":"157","ale":"158","ila":"159","lel":"160","ali":"161","eik":"162","olo":"163","onu":"164"," lo":"165","aua":"166","e o":"167","ola":"168","hon":"169","mam":"170","nan":"171"," au":"172","aha":"173","lau":"174","nua":"175","oho":"176","oma":"177"," ao":"178","ii ":"179","alu":"180","ima":"181","mau":"182","ike":"183","apa":"184","elo":"185","lii":"186","poe":"187","aia":"188","noa":"189"," in":"190","o m":"191","oka":"192","'u ":"193","aho":"194","ei ":"195","eka":"196","ha ":"197","lu ":"198","nei":"199","hol":"200","ino":"201","o e":"202","ema":"203","iwa":"204","olu":"205","ada":"206","naa":"207","pa ":"208","u k":"209","ewa":"210","hua":"211","lam":"212","lua":"213","o h":"214","ook":"215","u h":"216"," li":"217","ahu":"218","amu":"219","ui ":"220"," il":"221"," mo":"222"," se":"223","eia":"224","law":"225"," hu":"226"," ik":"227","ail":"228","e p":"229","li ":"230","lun":"231","uli":"232","io ":"233","kik":"234","noh":"235","u e":"236"," sa":"237","aaw":"238","awe":"239","ena":"240","hal":"241","kol":"242","lan":"243"," le":"244"," ne":"245","a'u":"246","ilo":"247","kap":"248","oko":"249","sa ":"250"," pe":"251","hop":"252","loa":"253","ope":"254","pe ":"255"," ad":"256"," pu":"257","ahe":"258","aol":"259","ia'":"260","lai":"261","loh":"262","na'":"263","oom":"264","aau":"265","eri":"266","kul":"267","we ":"268","ake":"269","kek":"270","laa":"271","ri ":"272","iku":"273","kak":"274","lim":"275","nah":"276","ner":"277","nui":"278","ono":"279","a u":"280","dam":"281","kum":"282","lok":"283","mua":"284","uma":"285","wal":"286","wi ":"287","'i ":"288","a'i":"289","aan":"290","alo":"291","eta":"292","mu ":"293","ohe":"294","u p":"295","ula":"296","uwa":"297"," nu":"298","amo":"299"},"hindi":{"\u0947\u0902 ":"0"," \u0939\u0948":"1","\u092e\u0947\u0902":"2"," \u092e\u0947":"3","\u0928\u0947 ":"4","\u0915\u0940 ":"5","\u0915\u0947 ":"6","\u0939\u0948 ":"7"," \u0915\u0947":"8"," \u0915\u0940":"9"," \u0915\u094b":"10","\u094b\u0902 ":"11","\u0915\u094b ":"12","\u093e \u0939":"13"," \u0915\u093e":"14","\u0938\u0947 ":"15","\u093e \u0915":"16","\u0947 \u0915":"17","\u0902 \u0915":"18","\u092f\u093e ":"19"," \u0915\u093f":"20"," \u0938\u0947":"21","\u0915\u093e ":"22","\u0940 \u0915":"23"," \u0928\u0947":"24"," \u0914\u0930":"25","\u0914\u0930 ":"26","\u0928\u093e ":"27","\u0915\u093f ":"28","\u092d\u0940 ":"29","\u0940 \u0938":"30"," \u091c\u093e":"31"," \u092a\u0930":"32","\u093e\u0930 ":"33"," \u0915\u0930":"34","\u0940 \u0939":"35"," \u0939\u094b":"36","\u0939\u0940 ":"37","\u093f\u092f\u093e":"38"," \u0907\u0938":"39"," \u0930\u0939":"40","\u0930 \u0915":"41","\u0941\u0928\u093e":"42","\u0924\u093e ":"43","\u093e\u0928 ":"44","\u0947 \u0938":"45"," \u092d\u0940":"46"," \u0930\u093e":"47","\u0947 \u0939":"48"," \u091a\u0941":"49"," \u092a\u093e":"50","\u092a\u0930 ":"51","\u091a\u0941\u0928":"52","\u0928\u093e\u0935":"53"," \u0915\u0939":"54","\u092a\u094d\u0930":"55"," \u092d\u093e":"56","\u0930\u093e\u091c":"57","\u0939\u0948\u0902":"58","\u093e \u0938":"59","\u0948 \u0915":"60","\u0948\u0902 ":"61","\u0928\u0940 ":"62","\u0932 \u0915":"63","\u0940\u0902 ":"64","\u093c\u0940 ":"65","\u0925\u093e ":"66","\u0930\u0940 ":"67","\u093e\u0935 ":"68","\u0947 \u092c":"69"," \u092a\u094d":"70","\u0915\u094d\u0937":"71","\u092a\u093e ":"72","\u0932\u0947 ":"73"," \u0926\u0947":"74","\u0932\u093e ":"75","\u0939\u093e ":"76","\u093e\u091c\u092a":"77"," \u0925\u093e":"78"," \u0928\u0939":"79","\u0907\u0938 ":"80","\u0915\u0930 ":"81","\u091c\u092a\u093e":"82","\u0928\u0939\u0940":"83","\u092d\u093e\u091c":"84","\u092f\u094b\u0902":"85","\u0930 \u0938":"86","\u0939\u0940\u0902":"87"," \u0905\u092e":"88"," \u092c\u093e":"89"," \u092e\u093e":"90"," \u0935\u093f":"91","\u0930\u0940\u0915":"92","\u093f\u090f ":"93","\u0947 \u092a":"94","\u094d\u092f\u093e":"95"," \u0939\u0940":"96","\u0902 \u092e":"97","\u0915\u093e\u0930":"98","\u093e \u091c":"99","\u0947 \u0932":"100"," \u0924\u093e":"101"," \u0926\u093f":"102"," \u0938\u093e":"103"," \u0939\u092e":"104","\u093e \u0928":"105","\u093e \u092e":"106","\u093e\u0915\u093c":"107","\u094d\u0924\u093e":"108"," \u090f\u0915":"109"," \u0938\u0902":"110"," \u0938\u094d":"111","\u0905\u092e\u0930":"112","\u0915\u093c\u0940":"113","\u0924\u093e\u091c":"114","\u092e\u0930\u0940":"115","\u0938\u094d\u0925":"116","\u093e \u0925":"117","\u093e\u0930\u094d":"118"," \u0939\u0941":"119","\u0907\u0930\u093e":"120","\u090f\u0915 ":"121","\u0928 \u0915":"122","\u0930 \u092e":"123","\u0930\u093e\u0915":"124","\u0940 \u091c":"125","\u0940 \u0928":"126"," \u0907\u0930":"127"," \u0909\u0928":"128"," \u092a\u0939":"129","\u0915\u0939\u093e":"130","\u0924\u0947 ":"131","\u0947 \u0905":"132"," \u0924\u094b":"133"," \u0938\u0941":"134","\u0924\u093f ":"135","\u0924\u0940 ":"136","\u0924\u094b ":"137","\u092e\u093f\u0932":"138","\u093f\u0915 ":"139","\u093f\u092f\u094b":"140","\u094d\u0930\u0947":"141"," \u0905\u092a":"142"," \u092b\u093c":"143"," \u0932\u093f":"144"," \u0932\u094b":"145"," \u0938\u092e":"146","\u092e \u0915":"147","\u0930\u094d\u091f":"148","\u0939\u094b ":"149","\u093e \u091a":"150","\u093e\u0908 ":"151","\u093e\u0928\u0947":"152","\u093f\u0928 ":"153","\u094d\u092f ":"154"," \u0909\u0938":"155"," \u0915\u093c":"156"," \u0938\u0915":"157"," \u0938\u0948":"158","\u0902 \u092a":"159","\u0902 \u0939":"160","\u0917\u0940 ":"161","\u0924 \u0915":"162","\u092e\u093e\u0928":"163","\u0930 \u0928":"164","\u0937\u094d\u091f":"165","\u0938 \u0915":"166","\u0938\u094d\u0924":"167","\u093e\u0901 ":"168","\u0940 \u092c":"169","\u0940 \u092e":"170","\u094d\u0930\u0940":"171"," \u0926\u094b":"172"," \u092e\u093f":"173"," \u092e\u0941":"174"," \u0932\u0947":"175"," \u0936\u093e":"176","\u0902 \u0938":"177","\u091c\u093c\u093e":"178","\u0924\u094d\u0930":"179","\u0925\u0940 ":"180","\u0932\u093f\u090f":"181","\u0938\u0940 ":"182","\u093c\u093e ":"183","\u093c\u093e\u0930":"184","\u093e\u0902\u0917":"185","\u0947 \u0926":"186","\u0947 \u092e":"187","\u094d\u0935 ":"188"," \u0928\u093e":"189"," \u092c\u0928":"190","\u0902\u0917\u094d":"191","\u0915\u093e\u0902":"192","\u0917\u093e ":"193","\u0917\u094d\u0930":"194","\u091c\u093e ":"195","\u091c\u094d\u092f":"196","\u0926\u0940 ":"197","\u0928 \u092e":"198","\u092a\u093e\u0930":"199","\u092d\u093e ":"200","\u0930\u0939\u0940":"201","\u0930\u0947 ":"202","\u0930\u0947\u0938":"203","\u0932\u0940 ":"204","\u0938\u092d\u093e":"205","\u093e \u0930":"206","\u093e\u0932 ":"207","\u0940 \u0905":"208","\u0940\u0915\u0940":"209","\u0947 \u0924":"210","\u0947\u0936 ":"211"," \u0905\u0902":"212"," \u0924\u0915":"213"," \u092f\u093e":"214","\u0908 \u0939":"215","\u0915\u0930\u0928":"216","\u0924\u0915 ":"217","\u0926\u0947\u0936":"218","\u0935\u0930\u094d":"219","\u093e\u092f\u093e":"220","\u0940 \u092d":"221","\u0947\u0938 ":"222","\u094d\u0937 ":"223"," \u0917\u092f":"224"," \u091c\u093f":"225"," \u0925\u0940":"226"," \u092c\u0921":"227"," \u092f\u0939":"228"," \u0935\u093e":"229","\u0902\u0924\u0930":"230","\u0905\u0902\u0924":"231","\u0915\u093c ":"232","\u0917\u092f\u093e":"233","\u091f\u0940 ":"234","\u0928\u093f\u0915":"235","\u0928\u094d\u0939":"236","\u092a\u0939\u0932":"237","\u092c\u0921\u093c":"238","\u092e\u093e\u0930":"239","\u0930 \u092a":"240","\u0930\u0928\u0947":"241","\u093e\u091c\u093c":"242","\u093f \u0907":"243","\u0940 \u0930":"244","\u0947 \u091c":"245","\u0947 \u0935":"246","\u094d\u091f ":"247","\u094d\u091f\u0940":"248"," \u0905\u092c":"249"," \u0932\u0917":"250"," \u0935\u0930":"251"," \u0938\u0940":"252","\u0902 \u092d":"253","\u0909\u0928\u094d":"254","\u0915 \u0915":"255","\u0915\u093f\u092f":"256","\u0926\u0947\u0916":"257","\u092a\u0942\u0930":"258","\u092b\u093c\u094d":"259","\u092f\u0939 ":"260","\u092f\u093e\u0928":"261","\u0930\u093f\u0915":"262","\u0930\u093f\u092f":"263","\u0930\u094d\u0921":"264","\u0932\u0947\u0915":"265","\u0938\u0915\u0924":"266","\u0939\u094b\u0902":"267","\u0939\u094b\u0917":"268","\u093e \u0905":"269","\u093e \u0926":"270","\u093e \u092a":"271","\u093e\u0926 ":"272","\u093e\u0930\u093e":"273","\u093f\u0924 ":"274","\u0940 \u0924":"275","\u0940 \u092a":"276","\u094b \u0915":"277","\u094b \u0926":"278"," \u0924\u0947":"279"," \u0928\u093f":"280"," \u0938\u0930":"281"," \u0939\u093e":"282","\u0902 \u0926":"283","\u0905\u092a\u0928":"284","\u091c\u093e\u0928":"285","\u0924 \u092e":"286","\u0925\u093f\u0924":"287","\u092a\u0928\u0940":"288","\u092e\u0939\u0932":"289","\u0930 \u0939":"290","\u0932\u094b\u0917":"291","\u0935 \u0915":"292","\u0939\u0928\u093e":"293","\u0939\u0932 ":"294","\u0939\u093e\u0901":"295","\u093e\u091c\u094d":"296","\u093e\u0928\u093e":"297","\u093f\u0915\u094d":"298","\u093f\u0938\u094d":"299"},"hungarian":{" a ":"0"," az":"1"," sz":"2","az ":"3"," me":"4","en ":"5"," el":"6"," ho":"7","ek ":"8","gy ":"9","tt ":"10","ett":"11","sze":"12"," fe":"13","\u00e9s ":"14"," ki":"15","tet":"16"," be":"17","et ":"18","ter":"19"," k\u00f6":"20"," \u00e9s":"21","hog":"22","meg":"23","ogy":"24","szt":"25","te ":"26","t a":"27","zet":"28","a m":"29","nek":"30","nt ":"31","s\u00e9g":"32","sz\u00e1":"33","ak ":"34"," va":"35","an ":"36","eze":"37","ra ":"38","ta ":"39"," mi":"40","int":"41","k\u00f6z":"42"," is":"43","esz":"44","fel":"45","min":"46","nak":"47","ors":"48","zer":"49"," te":"50","a a":"51","a k":"52","is ":"53"," cs":"54","ele":"55","er ":"56","men":"57","si ":"58","tek":"59","ti ":"60"," ne":"61","csa":"62","ent":"63","z e":"64","a t":"65","ala":"66","ere":"67","es ":"68","lom":"69","lte":"70","mon":"71","ond":"72","rsz":"73","sza":"74","tte":"75","z\u00e1g":"76","\u00e1ny":"77"," fo":"78"," ma":"79","ai ":"80","ben":"81","el ":"82","ene":"83","ik ":"84","jel":"85","t\u00e1s":"86","\u00e1ll":"87"," ha":"88"," le":"89"," \u00e1l":"90","agy":"91","al\u00e1":"92","isz":"93","y a":"94","zte":"95","\u00e1s ":"96"," al":"97","e a":"98","egy":"99","ely":"100","for":"101","lat":"102","lt ":"103","n a":"104","oga":"105","on ":"106","re ":"107","st ":"108","s\u00e1g":"109","t m":"110","\u00e1n ":"111","\u00e9t ":"112","\u00fclt":"113"," je":"114","gi ":"115","k a":"116","k\u00fcl":"117","lam":"118","len":"119","l\u00e1s":"120","m\u00e1s":"121","s k":"122","vez":"123","\u00e1so":"124","\u00f6z\u00f6":"125"," ta":"126","a s":"127","a v":"128","asz":"129","at\u00e1":"130","et\u0151":"131","kez":"132","let":"133","mag":"134","nem":"135","sz\u00e9":"136","z m":"137","\u00e1t ":"138","\u00e9te":"139","\u00f6lt":"140"," de":"141"," gy":"142"," k\u00e9":"143"," mo":"144"," v\u00e1":"145"," \u00e9r":"146","a b":"147","a f":"148","ami":"149","at ":"150","ato":"151","att":"152","bef":"153","dta":"154","gya":"155","hat":"156","i s":"157","las":"158","ndt":"159","rt ":"160","szo":"161","t k":"162","t\u00e1r":"163","t\u00e9s":"164","van":"165","\u00e1s\u00e1":"166","\u00f3l ":"167"," b\u00e9":"168"," eg":"169"," or":"170"," p\u00e1":"171"," p\u00e9":"172"," ve":"173","ban":"174","eke":"175","ek\u00fc":"176","el\u0151":"177","erv":"178","ete":"179","fog":"180","i a":"181","kis":"182","l\u00e1d":"183","nte":"184","nye":"185","nyi":"186","ok ":"187","om\u00e1":"188","os ":"189","r\u00e1n":"190","r\u00e1s":"191","sal":"192","t e":"193","v\u00e1l":"194","yar":"195","\u00e1go":"196","\u00e1la":"197","\u00e9ge":"198","\u00e9ny":"199","\u00f6tt":"200"," t\u00e1":"201","ad\u00f3":"202","elh":"203","fej":"204","het":"205","hoz":"206","ill":"207","j\u00e1r":"208","k\u00e9s":"209","llo":"210","mi ":"211","ny ":"212","ont":"213","ren":"214","res":"215","rin":"216","s a":"217","s e":"218","ssz":"219","zt ":"220"," ez":"221"," ka":"222"," ke":"223"," ko":"224"," re":"225","a h":"226","a n":"227","den":"228","d\u00f3 ":"229","efo":"230","gad":"231","gat":"232","gye":"233","hel":"234","k e":"235","ket":"236","les":"237","m\u00e1n":"238","nde":"239","nis":"240","ozz":"241","t b":"242","t i":"243","t \u00e9":"244","tat":"245","tos":"246","val":"247","z o":"248","zak":"249","\u00e1d ":"250","\u00e1ly":"251","\u00e1ra":"252","\u00e9si":"253","\u00e9sz":"254"," ak":"255"," am":"256"," es":"257"," h\u00e1":"258"," ny":"259"," t\u00f6":"260","aka":"261","art":"262","at\u00f3":"263","azt":"264","bbe":"265","ber":"266","ci\u00f3":"267","cso":"268","em ":"269","eti":"270","et\u00e9":"271","gal":"272","i t":"273","ini":"274","ist":"275","ja ":"276","ker":"277","ki ":"278","kor":"279","koz":"280","l \u00e9":"281","lj\u00e1":"282","lye":"283","n v":"284","ni ":"285","p\u00e1l":"286","ror":"287","r\u00f3l":"288","r\u00fcl":"289","s c":"290","s p":"291","s s":"292","s v":"293","sok":"294","t j":"295","t t":"296","tar":"297","tel":"298","vat":"299"},"icelandic":{"a\u00f0 ":"0","um ":"1"," a\u00f0":"2","ir ":"3","i\u00f0 ":"4","ur ":"5"," ve":"6"," \u00ed ":"7","na ":"8"," \u00e1 ":"9"," se":"10"," er":"11"," og":"12","ar ":"13","og ":"14","ver":"15"," mi":"16","inn":"17","nn ":"18"," fy":"19","er ":"20","fyr":"21"," ek":"22"," en":"23"," ha":"24"," he":"25","ekk":"26"," st":"27","ki ":"28","st ":"29","\u00f0i ":"30"," ba":"31"," me":"32"," vi":"33","ig ":"34","rir":"35","yri":"36"," um":"37","g f":"38","leg":"39","lei":"40","ns ":"41","\u00f0 s":"42"," ei":"43"," \u00fea":"44","in ":"45","kki":"46","r h":"47","r s":"48","egi":"49","ein":"50","ga ":"51","ing":"52","ra ":"53","sta":"54"," va":"55"," \u00fee":"56","ann":"57","en ":"58","mil":"59","sem":"60","tj\u00f3":"61","ar\u00f0":"62","di ":"63","eit":"64","haf":"65","ill":"66","ins":"67","ist":"68","llj":"69","ndi":"70","r a":"71","r e":"72","seg":"73","un ":"74","var":"75"," bi":"76"," el":"77"," fo":"78"," ge":"79"," yf":"80","and":"81","aug":"82","bau":"83","big":"84","ega":"85","eld":"86","er\u00f0":"87","fir":"88","foo":"89","gin":"90","itt":"91","n s":"92","ngi":"93","num":"94","od ":"95","ood":"96","sin":"97","ta ":"98","tt ":"99","vi\u00f0":"100","yfi":"101","\u00f0 e":"102","\u00f0 f":"103"," hr":"104"," s\u00e9":"105"," \u00fev":"106","a e":"107","a \u00e1":"108","em ":"109","gi ":"110","i f":"111","jar":"112","j\u00f3r":"113","lja":"114","m e":"115","r \u00e1":"116","rei":"117","rst":"118","r\u00f0a":"119","r\u00f0i":"120","r\u00f0u":"121","stj":"122","und":"123","veg":"124","v\u00ed ":"125","\u00f0 v":"126","\u00fea\u00f0":"127","\u00fev\u00ed":"128"," fj":"129"," ko":"130"," sl":"131","eik":"132","end":"133","ert":"134","ess":"135","fj\u00e1":"136","fur":"137","gir":"138","h\u00fas":"139","j\u00e1r":"140","n e":"141","ri ":"142","tar":"143","\u00f0 \u00fe":"144","\u00f0ar":"145","\u00f0ur":"146","\u00fees":"147"," br":"148"," h\u00fa":"149"," kr":"150"," le":"151"," up":"152","a s":"153","egg":"154","i s":"155","irt":"156","ja ":"157","ki\u00f0":"158","len":"159","me\u00f0":"160","mik":"161","n b":"162","nar":"163","nir":"164","nun":"165","r f":"166","r v":"167","ri\u00f0":"168","rt ":"169","sti":"170","t v":"171","ti ":"172","una":"173","upp":"174","\u00f0a ":"175","\u00f3na":"176"," al":"177"," fr":"178"," gr":"179","a v":"180","all":"181","an ":"182","da ":"183","ei\u00f0":"184","e\u00f0 ":"185","fa ":"186","fra":"187","g e":"188","ger":"189","gi\u00f0":"190","gt ":"191","han":"192","hef":"193","hel":"194","her":"195","hra":"196","i a":"197","i e":"198","i v":"199","i \u00fe":"200","iki":"201","j\u00f3n":"202","j\u00f6r":"203","ka ":"204","kr\u00f3":"205","l\u00edk":"206","m h":"207","n a":"208","nga":"209","r l":"210","ram":"211","ru ":"212","r\u00e1\u00f0":"213","r\u00f3n":"214","svo":"215","vin":"216","\u00ed b":"217","\u00ed h":"218","\u00f0 h":"219","\u00f0 k":"220","\u00f0 m":"221","\u00f6r\u00f0":"222"," af":"223"," fa":"224"," l\u00ed":"225"," r\u00e1":"226"," sk":"227"," sv":"228"," te":"229","a b":"230","a f":"231","a h":"232","a k":"233","a u":"234","afi":"235","agn":"236","arn":"237","ast":"238","ber":"239","efu":"240","enn":"241","erb":"242","erg":"243","fi ":"244","g a":"245","gar":"246","i\u00f0s":"247","ker":"248","kke":"249","lan":"250","lj\u00f3":"251","llt":"252","ma ":"253","mi\u00f0":"254","n v":"255","n \u00ed":"256","nan":"257","nda":"258","ndu":"259","ni\u00f0":"260","nna":"261","nnu":"262","nu ":"263","r o":"264","rbe":"265","rgi":"266","sl\u00f6":"267","s\u00e9 ":"268","t a":"269","t h":"270","til":"271","tin":"272","ugu":"273","vil":"274","ygg":"275","\u00e1 s":"276","\u00f0 a":"277","\u00f0 b":"278","\u00f3rn":"279","\u00f6gn":"280","\u00f6ku":"281"," at":"282"," fi":"283"," f\u00e9":"284"," ka":"285"," ma":"286"," no":"287"," sa":"288"," si":"289"," ti":"290"," \u00e1k":"291","a m":"292","a t":"293","a \u00ed":"294","a \u00fe":"295","afa":"296","afs":"297","ald":"298","arf":"299"},"indonesian":{"an ":"0"," me":"1","kan":"2","ang":"3","ng ":"4"," pe":"5","men":"6"," di":"7"," ke":"8"," da":"9"," se":"10","eng":"11"," be":"12","nga":"13","nya":"14"," te":"15","ah ":"16","ber":"17","aka":"18"," ya":"19","dan":"20","di ":"21","yan":"22","n p":"23","per":"24","a m":"25","ita":"26"," pa":"27","da ":"28","ata":"29","ada":"30","ya ":"31","ta ":"32"," in":"33","ala":"34","eri":"35","ia ":"36","a d":"37","n k":"38","am ":"39","ga ":"40","at ":"41","era":"42","n d":"43","ter":"44"," ka":"45","a p":"46","ari":"47","emb":"48","n m":"49","ri ":"50"," ba":"51","aan":"52","ak ":"53","ra ":"54"," it":"55","ara":"56","ela":"57","ni ":"58","ali":"59","ran":"60","ar ":"61","eru":"62","lah":"63","a b":"64","asi":"65","awa":"66","eba":"67","gan":"68","n b":"69"," ha":"70","ini":"71","mer":"72"," la":"73"," mi":"74","and":"75","ena":"76","wan":"77"," sa":"78","aha":"79","lam":"80","n i":"81","nda":"82"," wa":"83","a i":"84","dua":"85","g m":"86","mi ":"87","n a":"88","rus":"89","tel":"90","yak":"91"," an":"92","dal":"93","h d":"94","i s":"95","ing":"96","min":"97","ngg":"98","tak":"99","ami":"100","beb":"101","den":"102","gat":"103","ian":"104","ih ":"105","pad":"106","rga":"107","san":"108","ua ":"109"," de":"110","a t":"111","arg":"112","dar":"113","elu":"114","har":"115","i k":"116","i m":"117","i p":"118","ika":"119","in ":"120","iny":"121","itu":"122","mba":"123","n t":"124","ntu":"125","pan":"126","pen":"127","sah":"128","tan":"129","tu ":"130","a k":"131","ban":"132","edu":"133","eka":"134","g d":"135","ka ":"136","ker":"137","nde":"138","nta":"139","ora":"140","usa":"141"," du":"142"," ma":"143","a s":"144","ai ":"145","ant":"146","bas":"147","end":"148","i d":"149","ira":"150","kam":"151","lan":"152","n s":"153","uli":"154","al ":"155","apa":"156","ere":"157","ert":"158","lia":"159","mem":"160","rka":"161","si ":"162","tal":"163","ung":"164"," ak":"165","a a":"166","a w":"167","ani":"168","ask":"169","ent":"170","gar":"171","haa":"172","i i":"173","isa":"174","ked":"175","mbe":"176","ska":"177","tor":"178","uan":"179","uk ":"180","uka":"181"," ad":"182"," to":"183","asa":"184","aya":"185","bag":"186","dia":"187","dun":"188","erj":"189","mas":"190","na ":"191","rek":"192","rit":"193","sih":"194","us ":"195"," bi":"196","a h":"197","ama":"198","dib":"199","ers":"200","g s":"201","han":"202","ik ":"203","kem":"204","ma ":"205","n l":"206","nit":"207","r b":"208","rja":"209","sa ":"210"," ju":"211"," or":"212"," si":"213"," ti":"214","a y":"215","aga":"216","any":"217","as ":"218","cul":"219","eme":"220","emu":"221","eny":"222","epa":"223","erb":"224","erl":"225","gi ":"226","h m":"227","i a":"228","kel":"229","li ":"230","mel":"231","nia":"232","opa":"233","rta":"234","sia":"235","tah":"236","ula":"237","un ":"238","unt":"239"," at":"240"," bu":"241"," pu":"242"," ta":"243","agi":"244","alu":"245","amb":"246","bah":"247","bis":"248","er ":"249","i t":"250","ibe":"251","ir ":"252","ja ":"253","k m":"254","kar":"255","lai":"256","lal":"257","lu ":"258","mpa":"259","ngk":"260","nja":"261","or ":"262","pa ":"263","pas":"264","pem":"265","rak":"266","rik":"267","seb":"268","tam":"269","tem":"270","top":"271","tuk":"272","uni":"273","war":"274"," al":"275"," ga":"276"," ge":"277"," ir":"278"," ja":"279"," mu":"280"," na":"281"," pr":"282"," su":"283"," un":"284","ad ":"285","adi":"286","akt":"287","ann":"288","apo":"289","bel":"290","bul":"291","der":"292","ega":"293","eke":"294","ema":"295","emp":"296","ene":"297","enj":"298","esa":"299"},"italian":{" di":"0","to ":"1","la ":"2"," de":"3","di ":"4","no ":"5"," co":"6","re ":"7","ion":"8","e d":"9"," e ":"10","le ":"11","del":"12","ne ":"13","ti ":"14","ell":"15"," la":"16"," un":"17","ni ":"18","i d":"19","per":"20"," pe":"21","ent":"22"," in":"23","one":"24","he ":"25","ta ":"26","zio":"27","che":"28","o d":"29","a d":"30","na ":"31","ato":"32","e s":"33"," so":"34","i s":"35","lla":"36","a p":"37","li ":"38","te ":"39"," al":"40"," ch":"41","er ":"42"," pa":"43"," si":"44","con":"45","sta":"46"," pr":"47","a c":"48"," se":"49","el ":"50","ia ":"51","si ":"52","e p":"53"," da":"54","e i":"55","i p":"56","ont":"57","ano":"58","i c":"59","all":"60","azi":"61","nte":"62","on ":"63","nti":"64","o s":"65"," ri":"66","i a":"67","o a":"68","un ":"69"," an":"70","are":"71","ari":"72","e a":"73","i e":"74","ita":"75","men":"76","ri ":"77"," ca":"78"," il":"79"," no":"80"," po":"81","a s":"82","ant":"83","il ":"84","in ":"85","a l":"86","ati":"87","cia":"88","e c":"89","ro ":"90","ann":"91","est":"92","gli":"93","t\u00e0 ":"94"," qu":"95","e l":"96","nta":"97"," a ":"98","com":"99","o c":"100","ra ":"101"," le":"102"," ne":"103","ali":"104","ere":"105","ist":"106"," ma":"107"," \u00e8 ":"108","io ":"109","lle":"110","me ":"111","era":"112","ica":"113","ost":"114","pro":"115","tar":"116","una":"117"," pi":"118","da ":"119","tat":"120"," mi":"121","att":"122","ca ":"123","mo ":"124","non":"125","par":"126","sti":"127"," fa":"128"," i ":"129"," re":"130"," su":"131","ess":"132","ini":"133","nto":"134","o l":"135","ssi":"136","tto":"137","a e":"138","ame":"139","col":"140","ei ":"141","ma ":"142","o i":"143","za ":"144"," st":"145","a a":"146","ale":"147","anc":"148","ani":"149","i m":"150","ian":"151","o p":"152","oni":"153","sio":"154","tan":"155","tti":"156"," lo":"157","i r":"158","oci":"159","oli":"160","ona":"161","ono":"162","tra":"163"," l ":"164","a r":"165","eri":"166","ett":"167","lo ":"168","nza":"169","que":"170","str":"171","ter":"172","tta":"173"," ba":"174"," li":"175"," te":"176","ass":"177","e f":"178","enz":"179","for":"180","nno":"181","olo":"182","ori":"183","res":"184","tor":"185"," ci":"186"," vo":"187","a i":"188","al ":"189","chi":"190","e n":"191","lia":"192","pre":"193","ria":"194","uni":"195","ver":"196"," sp":"197","imo":"198","l a":"199","l c":"200","ran":"201","sen":"202","soc":"203","tic":"204"," fi":"205"," mo":"206","a n":"207","ce ":"208","dei":"209","ggi":"210","gio":"211","iti":"212","l s":"213","lit":"214","ll ":"215","mon":"216","ola":"217","pac":"218","sim":"219","tit":"220","utt":"221","vol":"222"," ar":"223"," fo":"224"," ha":"225"," sa":"226","acc":"227","e r":"228","ire":"229","man":"230","ntr":"231","rat":"232","sco":"233","tro":"234","tut":"235","va ":"236"," do":"237"," gi":"238"," me":"239"," sc":"240"," tu":"241"," ve":"242"," vi":"243","a m":"244","ber":"245","can":"246","cit":"247","i l":"248","ier":"249","it\u00e0":"250","lli":"251","min":"252","n p":"253","nat":"254","nda":"255","o e":"256","o f":"257","o u":"258","ore":"259","oro":"260","ort":"261","sto":"262","ten":"263","tiv":"264","van":"265","art":"266","cco":"267","ci ":"268","cos":"269","dal":"270","e v":"271","i i":"272","ila":"273","ino":"274","l p":"275","n c":"276","nit":"277","ole":"278","ome":"279","po ":"280","rio":"281","sa ":"282"," ce":"283"," es":"284"," tr":"285","a b":"286","and":"287","ata":"288","der":"289","ens":"290","ers":"291","gi ":"292","ial":"293","ina":"294","itt":"295","izi":"296","lan":"297","lor":"298","mil":"299"},"kazakh":{"\u0430\u043d ":"0","\u0435\u043d ":"1","\u044b\u04a3 ":"2"," \u049b\u0430":"3"," \u0431\u0430":"4","\u0430\u0439 ":"5","\u043d\u0434\u0430":"6","\u044b\u043d ":"7"," \u0441\u0430":"8"," \u0430\u043b":"9","\u0434\u0456 ":"10","\u0430\u0440\u044b":"11","\u0434\u044b ":"12","\u044b\u043f ":"13"," \u043c\u04b1":"14"," \u0431\u0456":"15","\u0430\u0441\u044b":"16","\u0434\u0430 ":"17","\u043d\u0430\u0439":"18"," \u0436\u0430":"19","\u043c\u04b1\u043d":"20","\u0441\u0442\u0430":"21","\u0493\u0430\u043d":"22","\u043d \u0431":"23","\u04b1\u043d\u0430":"24"," \u0431\u043e":"25","\u043d\u044b\u04a3":"26","\u0456\u043d ":"27","\u043b\u0430\u0440":"28","\u0441\u044b\u043d":"29"," \u0434\u0435":"30","\u0430\u0493\u0430":"31","\u0442\u0430\u043d":"32"," \u043a\u04e9":"33","\u0431\u0456\u0440":"34","\u0435\u0440 ":"35","\u043c\u0435\u043d":"36","\u0430\u0437\u0430":"37","\u044b\u043d\u0434":"38","\u044b\u043d\u044b":"39"," \u043c\u0435":"40","\u0430\u043d\u0434":"41","\u0435\u0440\u0456":"42","\u0431\u043e\u043b":"43","\u0434\u044b\u04a3":"44","\u049b\u0430\u0437":"45","\u0430\u0442\u044b":"46","\u0441\u044b ":"47","\u0442\u044b\u043d":"48","\u0493\u044b ":"49"," \u043a\u0435":"50","\u0430\u0440 ":"51","\u0437\u0430\u049b":"52","\u044b\u049b ":"53","\u0430\u043b\u0430":"54","\u0430\u043b\u044b":"55","\u0430\u043d\u044b":"56","\u0430\u0440\u0430":"57","\u0430\u0493\u044b":"58","\u0433\u0435\u043d":"59","\u0442\u0430\u0440":"60","\u0442\u0435\u0440":"61","\u0442\u044b\u0440":"62","\u0430\u0439\u0434":"63","\u0430\u0440\u0434":"64","\u0434\u0435 ":"65","\u0493\u0430 ":"66"," \u049b\u043e":"67","\u0431\u0430\u0440":"68","\u0456\u04a3 ":"69","\u049b\u0430\u043d":"70"," \u0431\u0435":"71"," \u049b\u044b":"72","\u0430\u049b\u0441":"73","\u0433\u0435\u0440":"74","\u0434\u0430\u043d":"75","\u0434\u0430\u0440":"76","\u043b\u044b\u049b":"77","\u043b\u0493\u0430":"78","\u044b\u043d\u0430":"79","\u0456\u0440 ":"80","\u0456\u0440\u0456":"81","\u0493\u0430\u0441":"82"," \u0442\u0430":"83","\u0430 \u0431":"84","\u0433\u0456 ":"85","\u0435\u0434\u0456":"86","\u0435\u043b\u0435":"87","\u0439\u0434\u044b":"88","\u043d \u043a":"89","\u043d \u0442":"90","\u043e\u043b\u0430":"91","\u0440\u044b\u043d":"92","\u0456\u043f ":"93","\u049b\u0441\u0442":"94","\u049b\u0442\u0430":"95","\u04a3 \u0431":"96"," \u0430\u0439":"97"," \u043e\u043b":"98"," \u0441\u043e":"99","\u0430\u0439\u0442":"100","\u0434\u0430\u0493":"101","\u0438\u0433\u0435":"102","\u043b\u0435\u0440":"103","\u043b\u044b\u043f":"104","\u043d \u0430":"105","\u0456\u043a ":"106","\u0430\u049b\u0442":"107","\u0431\u0430\u0493":"108","\u043a\u0435\u043d":"109","\u043d \u049b":"110","\u043d\u044b ":"111","\u0440\u0433\u0435":"112","\u0440\u0493\u0430":"113","\u044b\u0440 ":"114"," \u0430\u0440":"115","\u0430\u043b\u0493":"116","\u0430\u0441\u0430":"117","\u0431\u0430\u0441":"118","\u0431\u0435\u0440":"119","\u0433\u0435 ":"120","\u0435\u0442\u0456":"121","\u043d\u0430 ":"122","\u043d\u0434\u0435":"123","\u043d\u0435 ":"124","\u043d\u0438\u0433":"125","\u0440\u0434\u044b":"126","\u0440\u044b ":"127","\u0441\u0430\u0439":"128"," \u0430\u0443":"129"," \u043a\u04af":"130"," \u043d\u0438":"131"," \u043e\u0442":"132"," \u04e9\u0437":"133","\u0430\u0443\u0434":"134","\u0435\u043f ":"135","\u0438\u044f\u043b":"136","\u043b\u0442\u044b":"137","\u043d \u0436":"138","\u043d \u043e":"139","\u043e\u0441\u044b":"140","\u043e\u0442\u044b":"141","\u0440\u044b\u043f":"142","\u0440\u0456 ":"143","\u0442\u043a\u0435":"144","\u0442\u044b ":"145","\u044b \u0431":"146","\u044b \u0436":"147","\u044b\u043b\u044b":"148","\u044b\u0441\u044b":"149","\u0456 \u0441":"150","\u049b\u0430\u0440":"151"," \u0431\u04b1":"152"," \u0434\u0430":"153"," \u0436\u0435":"154"," \u0442\u04b1":"155"," \u049b\u04b1":"156","\u0430\u0434\u044b":"157","\u0430\u0439\u043b":"158","\u0430\u043f ":"159","\u0430\u0442\u0430":"160","\u0435\u043d\u0456":"161","\u0439\u043b\u0430":"162","\u043d \u043c":"163","\u043d \u0441":"164","\u043d\u0434\u044b":"165","\u043d\u0434\u0456":"166","\u0440 \u043c":"167","\u0442\u0430\u0439":"168","\u0442\u0456\u043d":"169","\u044b \u0442":"170","\u044b\u0441 ":"171","\u0456\u043d\u0434":"172"," \u0431\u0438":"173","\u0430 \u0436":"174","\u0430\u0443\u044b":"175","\u0434\u0435\u043f":"176","\u0434\u0456\u04a3":"177","\u0435\u043a\u0435":"178","\u0435\u0440\u0438":"179","\u0439\u044b\u043d":"180","\u043a\u0435\u043b":"181","\u043b\u0434\u044b":"182","\u043c\u0430 ":"183","\u043d\u0430\u043d":"184","\u043e\u043d\u044b":"185","\u043f \u0436":"186","\u043f \u043e":"187","\u0440 \u0431":"188","\u0440\u0438\u044f":"189","\u0440\u043b\u0430":"190","\u0443\u0434\u0430":"191","\u0448\u044b\u043b":"192","\u044b \u0430":"193","\u044b\u049b\u0442":"194","\u0456 \u0430":"195","\u0456 \u0431":"196","\u0456\u0437 ":"197","\u0456\u043b\u0456":"198","\u04a3 \u049b":"199"," \u0430\u0441":"200"," \u0435\u043a":"201"," \u0436\u043e":"202"," \u043c\u04d9":"203"," \u043e\u0441":"204"," \u0440\u0435":"205"," \u0441\u0435":"206","\u0430\u043b\u0434":"207","\u0434\u0430\u043b":"208","\u0434\u0435\u0433":"209","\u0434\u0435\u0439":"210","\u0435 \u0431":"211","\u0435\u0442 ":"212","\u0436\u0430\u0441":"213","\u0439 \u0431":"214","\u043b\u0430\u0443":"215","\u043b\u0434\u0430":"216","\u043c\u0435\u0442":"217","\u043d\u044b\u043d":"218","\u0441\u0430\u0440":"219","\u0441\u0456 ":"220","\u0442\u0456 ":"221","\u044b\u0440\u044b":"222","\u044b\u0442\u0430":"223","\u0456\u0441\u0456":"224","\u04a3 \u0430":"225","\u04e9\u0442\u0435":"226"," \u0430\u0442":"227"," \u0435\u043b":"228"," \u0436\u04af":"229"," \u043c\u0430":"230"," \u0442\u043e":"231"," \u0448\u044b":"232","\u0430 \u0430":"233","\u0430\u043b\u0442":"234","\u0430\u043c\u0430":"235","\u0430\u0440\u043b":"236","\u0430\u0441\u0442":"237","\u0431\u04b1\u043b":"238","\u0434\u0430\u0439":"239","\u0434\u044b\u049b":"240","\u0435\u043a ":"241","\u0435\u043b\u044c":"242","\u0435\u0441\u0456":"243","\u0437\u0434\u0456":"244","\u043a\u04e9\u0442":"245","\u043b\u0435\u043c":"246","\u043b\u044c ":"247","\u043d \u0435":"248","\u043f \u0430":"249","\u0440 \u0430":"250","\u0440\u0435\u0441":"251","\u0441\u0430 ":"252","\u0442\u0430 ":"253","\u0442\u0442\u0435":"254","\u0442\u04b1\u0440":"255","\u0448\u044b ":"256","\u044b \u0434":"257","\u044b \u049b":"258","\u044b\u0437 ":"259","\u049b\u044b\u0442":"260"," \u043a\u043e":"261"," \u043d\u0435":"262"," \u043e\u0439":"263"," \u043e\u0440":"264"," \u0441\u04b1":"265"," \u0442\u04af":"266","\u0430\u043b\u044c":"267","\u0430\u0440\u0435":"268","\u0430\u0442\u0442":"269","\u0434\u0456\u0440":"270","\u0435\u0432 ":"271","\u0435\u0433\u0456":"272","\u0435\u0434\u0430":"273","\u0435\u043a\u0456":"274","\u0435\u043b\u0434":"275","\u0435\u0440\u0433":"276","\u0435\u0440\u0434":"277","\u0438\u044f\u0434":"278","\u043a\u0435\u0440":"279","\u043a\u0435\u0442":"280","\u043b\u044b\u0441":"281","\u043b\u0456\u0441":"282","\u043c\u0435\u0434":"283","\u043c\u043f\u0438":"284","\u043d \u0434":"285","\u043d\u0456 ":"286","\u043d\u0456\u043d":"287","\u043f \u0442":"288","\u043f\u0435\u043a":"289","\u0440\u0435\u043b":"290","\u0440\u0442\u0430":"291","\u0440\u0456\u043b":"292","\u0440\u0456\u043d":"293","\u0441\u0435\u043d":"294","\u0442\u0430\u043b":"295","\u0448\u0456\u043b":"296","\u044b \u043a":"297","\u044b \u043c":"298","\u044b\u0441\u0442":"299"},"kyrgyz":{"\u044b\u043d ":"0","\u0430\u043d ":"1"," \u0436\u0430":"2","\u0435\u043d ":"3","\u0434\u0430 ":"4"," \u0442\u0430":"5","\u0430\u0440 ":"6","\u0438\u043d ":"7"," \u043a\u0430":"8","\u0430\u0440\u044b":"9"," \u0430\u043b":"10"," \u0431\u0430":"11"," \u0431\u0438":"12","\u043b\u0430\u0440":"13"," \u0431\u043e":"14"," \u043a\u044b":"15","\u0430\u043b\u0430":"16","\u043d \u043a":"17"," \u0441\u0430":"18","\u043d\u0434\u0430":"19","\u0433\u0430\u043d":"20","\u0442\u0430\u0440":"21"," \u0434\u0435":"22","\u0430\u043d\u0434":"23","\u043d \u0431":"24"," \u043a\u0435":"25","\u0430\u0440\u0434":"26","\u043c\u0435\u043d":"27","\u043d \u0442":"28","\u0430\u0440\u0430":"29","\u043d\u044b\u043d":"30"," \u0434\u0430":"31"," \u043c\u0435":"32","\u043a\u044b\u0440":"33"," \u0447\u0435":"34","\u043d \u0430":"35","\u0440\u044b ":"36"," \u043a\u043e":"37","\u0433\u0435\u043d":"38","\u0434\u0430\u0440":"39","\u043a\u0435\u043d":"40","\u043a\u0442\u0430":"41","\u0443\u0443 ":"42","\u0435\u043d\u0435":"43","\u0435\u0440\u0438":"44"," \u0448\u0430":"45","\u0430\u043b\u044b":"46","\u0430\u0442 ":"47","\u043d\u0430 ":"48"," \u043a\u04e9":"49"," \u044d\u043c":"50","\u0430\u0442\u044b":"51","\u0434\u0430\u043d":"52","\u0434\u0435\u043f":"53","\u0434\u044b\u043d":"54","\u0435\u043f ":"55","\u043d\u0435\u043d":"56","\u0440\u044b\u043d":"57"," \u0431\u0435":"58","\u043a\u0430\u043d":"59","\u043b\u0443\u0443":"60","\u0440\u0433\u044b":"61","\u0442\u0430\u043d":"62","\u0448\u0430\u0439":"63","\u044b\u0440\u0433":"64","\u04af\u043d ":"65"," \u0430\u0440":"66"," \u043c\u0430":"67","\u0430\u0433\u044b":"68","\u0430\u043a\u0442":"69","\u0430\u043d\u044b":"70","\u0433\u044b ":"71","\u0433\u044b\u0437":"72","\u0434\u044b ":"73","\u0440\u0434\u0430":"74","\u0430\u0439 ":"75","\u0431\u0438\u0440":"76","\u0431\u043e\u043b":"77","\u0435\u0440 ":"78","\u043d \u0441":"79","\u043d\u0434\u044b":"80","\u0443\u043d ":"81","\u0447\u0430 ":"82","\u044b\u043d\u0434":"83","\u0430 \u043a":"84","\u0430\u0433\u0430":"85","\u0430\u0439\u043b":"86","\u0430\u043d\u0430":"87","\u0430\u043f ":"88","\u0433\u0430 ":"89","\u043b\u0433\u0435":"90","\u043d\u0447\u0430":"91","\u043f \u043a":"92","\u0440\u0434\u044b":"93","\u0442\u0443\u0443":"94","\u044b\u043d\u044b":"95"," \u0430\u043d":"96"," \u04e9\u0437":"97","\u0430\u043c\u0430":"98","\u0430\u0442\u0430":"99","\u0434\u0438\u043d":"100","\u0439\u0442 ":"101","\u043b\u0433\u0430":"102","\u043b\u043e\u043e":"103","\u043e\u043e ":"104","\u0440\u0438 ":"105","\u0442\u0438\u043d":"106","\u044b\u0437 ":"107","\u044b\u043f ":"108","\u04e9\u0440\u04af":"109"," \u043f\u0430":"110"," \u044d\u043a":"111","\u0430 \u0431":"112","\u0430\u043b\u0433":"113","\u0430\u0441\u044b":"114","\u0430\u0448\u0442":"115","\u0431\u0438\u0437":"116","\u043a\u0435\u043b":"117","\u043a\u0442\u0435":"118","\u0442\u0430\u043b":"119"," \u043d\u0435":"120"," \u0441\u0443":"121","\u0430\u043a\u044b":"122","\u0435\u043d\u0442":"123","\u0438\u043d\u0434":"124","\u0438\u0440 ":"125","\u043a\u0430\u043b":"126","\u043d \u0434":"127","\u043d\u0434\u0435":"128","\u043e\u0433\u043e":"129","\u043e\u043d\u0434":"130","\u043e\u044e\u043d":"131","\u0440 \u0431":"132","\u0440 \u043c":"133","\u0440\u0430\u043d":"134","\u0441\u0430\u043b":"135","\u0441\u0442\u0430":"136","\u0441\u044b ":"137","\u0443\u0440\u0430":"138","\u044b\u0433\u044b":"139"," \u0430\u0448":"140"," \u043c\u0438":"141"," \u0441\u044b":"142"," \u0442\u0443":"143","\u0430\u043b ":"144","\u0430\u0440\u0442":"145","\u0431\u043e\u0440":"146","\u0435\u043b\u0433":"147","\u0435\u043d\u0438":"148","\u0435\u0442 ":"149","\u0436\u0430\u0442":"150","\u0439\u043b\u043e":"151","\u043a\u0430\u0440":"152","\u043d \u043c":"153","\u043e\u0433\u0443":"154","\u043f \u0430":"155","\u043f \u0436":"156","\u0440 \u044d":"157","\u0441\u044b\u043d":"158","\u044b\u043a ":"159","\u044e\u043d\u0447":"160"," \u0431\u0443":"161"," \u0443\u0440":"162","\u0430 \u0430":"163","\u0430\u043a ":"164","\u0430\u043b\u0434":"165","\u0430\u043b\u0443":"166","\u0431\u0430\u0440":"167","\u0431\u0435\u0440":"168","\u0431\u043e\u044e":"169","\u0433\u0435 ":"170","\u0434\u043e\u043d":"171","\u0435\u0433\u0438":"172","\u0435\u043a\u0442":"173","\u0435\u0444\u0442":"174","\u0438\u0437 ":"175","\u043a\u0430\u0442":"176","\u043b\u0434\u044b":"177","\u043d \u0447":"178","\u043d \u044d":"179","\u043d \u04e9":"180","\u043d\u0434\u043e":"181","\u043d\u0435\u0444":"182","\u043e\u043d ":"183","\u0441\u0430\u0442":"184","\u0442\u043e\u0440":"185","\u0442\u044b ":"186","\u0443\u0434\u0430":"187","\u0443\u043b ":"188","\u0443\u043b\u0430":"189","\u0443\u0443\u0434":"190","\u044b \u0431":"191","\u044b \u0436":"192","\u044b \u043a":"193","\u044b\u043b ":"194","\u044b\u043d\u0430":"195","\u044d\u043a\u0435":"196","\u044f\u0441\u044b":"197"," \u0430\u0442":"198"," \u0434\u043e":"199"," \u0436\u044b":"200"," \u0441\u043e":"201"," \u0447\u044b":"202","\u0430\u0430\u0441":"203","\u0430\u0439\u0442":"204","\u0430\u0441\u0442":"205","\u0431\u0430\u0430":"206","\u0431\u0430\u0448":"207","\u0433\u0430\u0440":"208","\u0433\u044b\u043d":"209","\u0434\u04e9 ":"210","\u0435 \u0431":"211","\u0435\u043a ":"212","\u0436\u044b\u043b":"213","\u0438 \u0431":"214","\u0438\u043a ":"215","\u0438\u044f\u0441":"216","\u043a\u044b\u0437":"217","\u043b\u0434\u0430":"218","\u043b\u044b\u043a":"219","\u043c\u0434\u0430":"220","\u043d \u0436":"221","\u043d\u0434\u0438":"222","\u043d\u0438 ":"223","\u043d\u0438\u043d":"224","\u043e\u0440\u0434":"225","\u0440\u0434\u043e":"226","\u0441\u0442\u043e":"227","\u0442\u0430 ":"228","\u0442\u0435\u0440":"229","\u0442\u0442\u0438":"230","\u0442\u0443\u0440":"231","\u0442\u044b\u043d":"232","\u0443\u043f ":"233","\u0443\u0448\u0443":"234","\u0444\u0442\u0438":"235","\u044b\u043a\u0442":"236","\u04af\u043f ":"237","\u04e9\u043d ":"238"," \u0430\u0439":"239"," \u0431\u04af":"240"," \u0438\u0447":"241"," \u0438\u0448":"242"," \u043c\u043e":"243"," \u043f\u0440":"244"," \u0440\u0435":"245"," \u04e9\u043a":"246"," \u04e9\u0442":"247","\u0430 \u0434":"248","\u0430 \u0443":"249","\u0430 \u044d":"250","\u0430\u0439\u043c":"251","\u0430\u043c\u0434":"252","\u0430\u0442\u0442":"253","\u0431\u0435\u043a":"254","\u0431\u0443\u043b":"255","\u0433\u043e\u043b":"256","\u0434\u0435\u0433":"257","\u0435\u0433\u0435":"258","\u0435\u0439\u0442":"259","\u0435\u043b\u0435":"260","\u0435\u043d\u0434":"261","\u0436\u0430\u043a":"262","\u0438 \u043a":"263","\u0438\u043d\u0438":"264","\u0438\u0440\u0438":"265","\u0439\u043c\u0430":"266","\u043a\u0442\u043e":"267","\u043b\u0438\u043a":"268","\u043c\u0430\u043a":"269","\u043c\u0435\u0441":"270","\u043d \u0443":"271","\u043d \u0448":"272","\u043d\u0442\u0442":"273","\u043e\u043b ":"274","\u043e\u043b\u043e":"275","\u043f\u0430\u0440":"276","\u0440\u0430\u043a":"277","\u0440\u04af\u04af":"278","\u0441\u044b\u0440":"279","\u0442\u0438 ":"280","\u0442\u0438\u043a":"281","\u0442\u0442\u0430":"282","\u0442\u04e9\u0440":"283","\u0443 \u0436":"284","\u0443 \u0441":"285","\u0448\u043a\u0430":"286","\u044b \u043c":"287","\u044b\u0437\u044b":"288","\u044b\u043b\u0434":"289","\u044d\u043c\u0435":"290","\u04af\u0440\u04af":"291","\u04e9\u043b\u04af":"292","\u04e9\u0442\u04e9":"293"," \u0436\u0435":"294"," \u0442\u04af":"295"," \u044d\u043b":"296"," \u04e9\u043d":"297","\u0430 \u0436":"298","\u0430\u0434\u044b":"299"},"latin":{"um ":"0","us ":"1","ut ":"2","et ":"3","is ":"4"," et":"5"," in":"6"," qu":"7","tur":"8"," pr":"9","est":"10","tio":"11"," au":"12","am ":"13","em ":"14","aut":"15"," di":"16","ent":"17","in ":"18","dic":"19","t e":"20"," es":"21","ur ":"22","ati":"23","ion":"24","st ":"25"," ut":"26","ae ":"27","qua":"28"," de":"29","nt ":"30"," su":"31"," si":"32","itu":"33","unt":"34","rum":"35","ia ":"36","es ":"37","ter":"38"," re":"39","nti":"40","rae":"41","s e":"42","qui":"43","io ":"44","pro":"45","it ":"46","per":"47","ita":"48","one":"49","ici":"50","ius":"51"," co":"52","t d":"53","bus":"54","pra":"55","m e":"56"," no":"57","edi":"58","tia":"59","ue ":"60","ibu":"61"," se":"62"," ad":"63","er ":"64"," fi":"65","ili":"66","que":"67","t i":"68","de ":"69","oru":"70"," te":"71","ali":"72"," pe":"73","aed":"74","cit":"75","m d":"76","t s":"77","tat":"78","tem":"79","tis":"80","t p":"81","sti":"82","te ":"83","cum":"84","ere":"85","ium":"86"," ex":"87","rat":"88","ta ":"89","con":"90","cti":"91","oni":"92","ra ":"93","s i":"94"," cu":"95"," sa":"96","eni":"97","nis":"98","nte":"99","eri":"100","omi":"101","re ":"102","s a":"103","min":"104","os ":"105","ti ":"106","uer":"107"," ma":"108"," ue":"109","m s":"110","nem":"111","t m":"112"," mo":"113"," po":"114"," ui":"115","gen":"116","ict":"117","m i":"118","ris":"119","s s":"120","t a":"121","uae":"122"," do":"123","m a":"124","t c":"125"," ge":"126","as ":"127","e i":"128","e p":"129","ne ":"130"," ca":"131","ine":"132","quo":"133","s p":"134"," al":"135","e e":"136","ntu":"137","ro ":"138","tri":"139","tus":"140","uit":"141","atu":"142","ini":"143","iqu":"144","m p":"145","ost":"146","res":"147","ura":"148"," ac":"149"," fu":"150","a e":"151","ant":"152","nes":"153","nim":"154","sun":"155","tra":"156","e a":"157","s d":"158"," pa":"159"," uo":"160","ecu":"161"," om":"162"," tu":"163","ad ":"164","cut":"165","omn":"166","s q":"167"," ei":"168","ex ":"169","icu":"170","tor":"171","uid":"172"," ip":"173"," me":"174","e s":"175","era":"176","eru":"177","iam":"178","ide":"179","ips":"180"," iu":"181","a s":"182","do ":"183","e d":"184","eiu":"185","ica":"186","im ":"187","m c":"188","m u":"189","tiu":"190"," ho":"191","cat":"192","ist":"193","nat":"194","on ":"195","pti":"196","reg":"197","rit":"198","s t":"199","sic":"200","spe":"201"," en":"202"," sp":"203","dis":"204","eli":"205","liq":"206","lis":"207","men":"208","mus":"209","num":"210","pos":"211","sio":"212"," an":"213"," gr":"214","abi":"215","acc":"216","ect":"217","ri ":"218","uan":"219"," le":"220","ecc":"221","ete":"222","gra":"223","non":"224","se ":"225","uen":"226","uis":"227"," fa":"228"," tr":"229","ate":"230","e c":"231","fil":"232","na ":"233","ni ":"234","pul":"235","s f":"236","ui ":"237","at ":"238","cce":"239","dam":"240","i e":"241","ina":"242","leg":"243","nos":"244","ori":"245","pec":"246","rop":"247","sta":"248","uia":"249","ene":"250","iue":"251","iui":"252","siu":"253","t t":"254","t u":"255","tib":"256","tit":"257"," da":"258"," ne":"259","a d":"260","and":"261","ege":"262","equ":"263","hom":"264","imu":"265","lor":"266","m m":"267","mni":"268","ndo":"269","ner":"270","o e":"271","r e":"272","sit":"273","tum":"274","utu":"275","a p":"276","bis":"277","bit":"278","cer":"279","cta":"280","dom":"281","fut":"282","i s":"283","ign":"284","int":"285","mod":"286","ndu":"287","nit":"288","rib":"289","rti":"290","tas":"291","und":"292"," ab":"293","err":"294","ers":"295","ite":"296","iti":"297","m t":"298","o p":"299"},"latvian":{"as ":"0"," la":"1"," pa":"2"," ne":"3","es ":"4"," un":"5","un ":"6"," ka":"7"," va":"8","ar ":"9","s p":"10"," ar":"11"," vi":"12","is ":"13","ai ":"14"," no":"15","ja ":"16","ija":"17","iem":"18","em ":"19","tu ":"20","tie":"21","vie":"22","lat":"23","aks":"24","ien":"25","kst":"26","ies":"27","s a":"28","rak":"29","atv":"30","tvi":"31"," ja":"32"," pi":"33","ka ":"34"," ir":"35","ir ":"36","ta ":"37"," sa":"38","ts ":"39"," k\u0101":"40","\u0101s ":"41"," ti":"42","ot ":"43","s n":"44"," ie":"45"," ta":"46","ar\u012b":"47","par":"48","pie":"49"," pr":"50","k\u0101 ":"51"," at":"52"," ra":"53","am ":"54","in\u0101":"55","t\u0101 ":"56"," iz":"57","jas":"58","lai":"59"," na":"60","aut":"61","ie\u0161":"62","s s":"63"," ap":"64"," ko":"65"," st":"66","iek":"67","iet":"68","jau":"69","us ":"70","r\u012b ":"71","tik":"72","\u012bba":"73","na ":"74"," ga":"75","cij":"76","s i":"77"," uz":"78","jum":"79","s v":"80","ms ":"81","var":"82"," ku":"83"," ma":"84","j\u0101 ":"85","sta":"86","s u":"87"," t\u0101":"88","die":"89","kai":"90","kas":"91","ska":"92"," ci":"93"," da":"94","kur":"95","lie":"96","tas":"97","a p":"98","est":"99","st\u0101":"100","\u0161an":"101","nes":"102","nie":"103","s d":"104","s m":"105","val":"106"," di":"107"," es":"108"," re":"109","no ":"110","to ":"111","umu":"112","vai":"113","\u0161i ":"114"," v\u0113":"115","kum":"116","nu ":"117","rie":"118","s t":"119","\u0101m ":"120","ad ":"121","et ":"122","mu ":"123","s l":"124"," be":"125","aud":"126","tur":"127","vij":"128","vi\u0146":"129","\u0101ju":"130","bas":"131","gad":"132","i n":"133","ika":"134","os ":"135","a v":"136","not":"137","oti":"138","sts":"139","aik":"140","u a":"141","\u0101 a":"142","\u0101k ":"143"," to":"144","ied":"145","stu":"146","ti ":"147","u p":"148","v\u0113l":"149","\u0101ci":"150"," \u0161o":"151","gi ":"152","ko ":"153","pro":"154","s r":"155","t\u0101j":"156","u s":"157","u v":"158","vis":"159","aun":"160","ks ":"161","str":"162","zin":"163","a a":"164","ad\u012b":"165","da ":"166","dar":"167","ena":"168","ici":"169","kra":"170","nas":"171","st\u012b":"172","\u0161u ":"173"," m\u0113":"174","a n":"175","eci":"176","i s":"177","ie ":"178","i\u0146a":"179","ju ":"180","las":"181","r t":"182","ums":"183","\u0161ie":"184","bu ":"185","cit":"186","i a":"187","ina":"188","ma ":"189","pus":"190","ra ":"191"," au":"192"," se":"193"," sl":"194","a s":"195","ais":"196","e\u0161i":"197","iec":"198","iku":"199","p\u0101r":"200","s b":"201","s k":"202","sot":"203","\u0101d\u0101":"204"," in":"205"," li":"206"," tr":"207","ana":"208","eso":"209","ikr":"210","man":"211","ne ":"212","u k":"213"," tu":"214","an ":"215","av ":"216","bet":"217","b\u016bt":"218","im ":"219","isk":"220","l\u012bd":"221","nav":"222","ras":"223","ri ":"224","s g":"225","sti":"226","\u012bdz":"227"," ai":"228","arb":"229","cin":"230","das":"231","ent":"232","gal":"233","i p":"234","lik":"235","m\u0101 ":"236","nek":"237","pat":"238","r\u0113t":"239","si ":"240","tra":"241","u\u0161i":"242","vei":"243"," br":"244"," pu":"245"," sk":"246","als":"247","ama":"248","edz":"249","eka":"250","e\u0161u":"251","ieg":"252","jis":"253","kam":"254","lst":"255","n\u0101k":"256","oli":"257","pre":"258","p\u0113c":"259","rot":"260","t\u0101s":"261","usi":"262","\u0113l ":"263","\u0113s ":"264"," bi":"265"," de":"266"," me":"267"," p\u0101":"268","a i":"269","aid":"270","aj\u0101":"271","ikt":"272","kat":"273","lic":"274","lod":"275","mi ":"276","ni ":"277","pri":"278","r\u0101d":"279","r\u012bg":"280","sim":"281","tr\u0101":"282","u l":"283","uto":"284","uz ":"285","\u0113c ":"286","\u012bt\u0101":"287"," ce":"288"," j\u0101":"289"," sv":"290","a t":"291","aga":"292","aiz":"293","atu":"294","ba ":"295","cie":"296","du ":"297","dzi":"298","dz\u012b":"299"},"lithuanian":{"as ":"0"," pa":"1"," ka":"2","ai ":"3","us ":"4","os ":"5","is ":"6"," ne":"7"," ir":"8","ir ":"9","ti ":"10"," pr":"11","aus":"12","ini":"13","s p":"14","pas":"15","i\u0173 ":"16"," ta":"17"," vi":"18","iau":"19"," ko":"20"," su":"21","kai":"22","o p":"23","usi":"24"," sa":"25","vo ":"26","tai":"27","ali":"28","t\u0173 ":"29","io ":"30","jo ":"31","s k":"32","sta":"33","iai":"34"," bu":"35"," nu":"36","ius":"37","mo ":"38"," po":"39","ien":"40","s s":"41","tas":"42"," me":"43","uvo":"44","kad":"45"," i\u0161":"46"," la":"47","to ":"48","ais":"49","ie ":"50","kur":"51","uri":"52"," ku":"53","ijo":"54","\u010dia":"55","au ":"56","met":"57","je ":"58"," va":"59","ad ":"60"," ap":"61","and":"62"," gr":"63"," ti":"64","kal":"65","asi":"66","i p":"67","i\u010di":"68","s i":"69","s v":"70","ink":"71","o n":"72","\u0117s ":"73","buv":"74","s a":"75"," ga":"76","aip":"77","avi":"78","mas":"79","pri":"80","tik":"81"," re":"82","etu":"83","jos":"84"," da":"85","ent":"86","oli":"87","par":"88","ant":"89","ara":"90","tar":"91","ama":"92","gal":"93","imo":"94","i\u0161k":"95","o s":"96"," at":"97"," be":"98"," \u012f ":"99","min":"100","tin":"101"," tu":"102","s n":"103"," jo":"104","dar":"105","ip ":"106","rei":"107"," te":"108","d\u017ei":"109","kas":"110","nin":"111","tei":"112","vie":"113"," li":"114"," se":"115","cij":"116","gar":"117","lai":"118","art":"119","lau":"120","ras":"121","no ":"122","o k":"123","t\u0105 ":"124"," ar":"125","\u0117jo":"126","vi\u010d":"127","iga":"128","pra":"129","vis":"130"," na":"131","men":"132","oki":"133","ra\u0161":"134","s t":"135","iet":"136","ika":"137","int":"138","kom":"139","tam":"140","aug":"141","avo":"142","rie":"143","s b":"144"," st":"145","eim":"146","ko ":"147","nus":"148","pol":"149","ria":"150","sau":"151","api":"152","me ":"153","ne ":"154","sik":"155"," \u0161i":"156","i n":"157","ia ":"158","ici":"159","oja":"160","sak":"161","sti":"162","ui ":"163","ame":"164","lie":"165","o t":"166","pie":"167","\u010diu":"168"," di":"169"," pe":"170","gri":"171","ios":"172","lia":"173","lin":"174","s d":"175","s g":"176","ta ":"177","uot":"178"," ja":"179"," u\u017e":"180","aut":"181","i s":"182","ino":"183","m\u0105 ":"184","oje":"185","rav":"186","d\u0117l":"187","nti":"188","o a":"189","toj":"190","\u0117l ":"191"," to":"192"," vy":"193","ar ":"194","ina":"195","lic":"196","o v":"197","sei":"198","su ":"199"," mi":"200"," pi":"201","din":"202","i\u0161 ":"203","lan":"204","si ":"205","tus":"206"," ba":"207","asa":"208","ata":"209","kla":"210","omi":"211","tat":"212"," an":"213"," ji":"214","als":"215","ena":"216","j\u0173 ":"217","nuo":"218","per":"219","rig":"220","s m":"221","val":"222","yta":"223","\u010dio":"224"," ra":"225","i k":"226","lik":"227","net":"228","n\u0117 ":"229","tis":"230","tuo":"231","yti":"232","\u0119s ":"233","\u0173 s":"234","ada":"235","ari":"236","do ":"237","eik":"238","eis":"239","ist":"240","lst":"241","ma ":"242","nes":"243","sav":"244","sio":"245","tau":"246"," ki":"247","aik":"248","aud":"249","ies":"250","ori":"251","s r":"252","ska":"253"," ge":"254","ast":"255","eig":"256","et ":"257","iam":"258","isa":"259","mis":"260","nam":"261","ome":"262","\u017eia":"263","aba":"264","aul":"265","ikr":"266","k\u0105 ":"267","nta":"268","ra ":"269","tur":"270"," ma":"271","die":"272","ei ":"273","i t":"274","nas":"275","rin":"276","sto":"277","tie":"278","tuv":"279","vos":"280","\u0173 p":"281"," d\u0117":"282","are":"283","ats":"284","en\u0117":"285","ili":"286","ima":"287","kar":"288","ms ":"289","nia":"290","r p":"291","rod":"292","s l":"293"," o ":"294","e p":"295","es ":"296","ide":"297","ik ":"298","ja ":"299"},"macedonian":{"\u043d\u0430 ":"0"," \u043d\u0430":"1","\u0442\u0430 ":"2","\u0430\u0442\u0430":"3","\u0438\u0458\u0430":"4"," \u043f\u0440":"5","\u0442\u043e ":"6","\u0458\u0430 ":"7"," \u0437\u0430":"8","\u0430 \u043d":"9"," \u0438 ":"10","\u0430 \u0441":"11","\u0442\u0435 ":"12","\u0438\u0442\u0435":"13"," \u043a\u043e":"14","\u043e\u0442 ":"15"," \u0434\u0435":"16"," \u043f\u043e":"17","\u0430 \u0434":"18","\u0432\u043e ":"19","\u0437\u0430 ":"20"," \u0432\u043e":"21"," \u043e\u0434":"22"," \u0441\u0435":"23"," \u043d\u0435":"24","\u0441\u0435 ":"25"," \u0434\u043e":"26","\u0430 \u0432":"27","\u043a\u0430 ":"28","\u0430\u045a\u0435":"29","\u0430 \u043f":"30","\u043e \u043f":"31","\u0443\u0432\u0430":"32","\u0446\u0438\u0458":"33","\u0430 \u043e":"34","\u0438\u0446\u0438":"35","\u0435\u0442\u043e":"36","\u043e \u043d":"37","\u0430\u043d\u0438":"38","\u043d\u0438 ":"39"," \u0432\u043b":"40","\u0434\u0435\u043a":"41","\u0435\u043a\u0430":"42","\u045a\u0435\u0442":"43","\u045c\u0435 ":"44"," \u0435 ":"45","\u0430 \u0437":"46","\u0430 \u0438":"47","\u0430\u0442 ":"48","\u0432\u043b\u0430":"49","\u0433\u043e ":"50","\u0435 \u043d":"51","\u043e\u0434 ":"52","\u043f\u0440\u0435":"53"," \u0433\u043e":"54"," \u0434\u0430":"55"," \u043c\u0430":"56"," \u0440\u0435":"57"," \u045c\u0435":"58","\u0430\u043b\u0438":"59","\u0438 \u0434":"60","\u0438 \u043d":"61","\u0438\u043e\u0442":"62","\u043d\u0430\u0442":"63","\u043e\u0432\u043e":"64"," \u043f\u0430":"65"," \u0440\u0430":"66"," \u0441\u043e":"67","\u043e\u0432\u0435":"68","\u043f\u0440\u0430":"69","\u0448\u0442\u043e":"70","\u045a\u0435 ":"71","\u0430 \u0435":"72","\u0434\u0430 ":"73","\u0434\u0430\u0442":"74","\u0434\u043e\u043d":"75","\u0435 \u0432":"76","\u0435 \u0434":"77","\u0435 \u0437":"78","\u0435 \u0441":"79","\u043a\u043e\u043d":"80","\u043d\u0438\u0442":"81","\u043d\u043e ":"82","\u043e\u043d\u0438":"83","\u043e\u0442\u043e":"84","\u043f\u0430\u0440":"85","\u043f\u0440\u0438":"86","\u0441\u0442\u0430":"87","\u0442 \u043d":"88"," \u0448\u0442":"89","\u0430 \u043a":"90","\u0430\u0446\u0438":"91","\u0432\u0430 ":"92","\u0432\u0430\u045a":"93","\u0435 \u043f":"94","\u0435\u043d\u0438":"95","\u043b\u0430 ":"96","\u043b\u0430\u0434":"97","\u043c\u0430\u043a":"98","\u043d\u0435\u0441":"99","\u043d\u043e\u0441":"100","\u043f\u0440\u043e":"101","\u0440\u0435\u043d":"102","\u0458\u0430\u0442":"103"," \u0438\u043d":"104"," \u043c\u0435":"105"," \u0442\u043e":"106","\u0430 \u0433":"107","\u0430 \u043c":"108","\u0430 \u0440":"109","\u0430\u043a\u0435":"110","\u0430\u043a\u043e":"111","\u0432\u043e\u0440":"112","\u0433\u043e\u0432":"113","\u0435\u0434\u043e":"114","\u0435\u043d\u0430":"115","\u0438 \u0438":"116","\u0438\u0440\u0430":"117","\u043a\u0435\u0434":"118","\u043d\u0435 ":"119","\u043d\u0438\u0446":"120","\u043d\u0438\u0458":"121","\u043e\u0441\u0442":"122","\u0440\u0430 ":"123","\u0440\u0430\u0442":"124","\u0440\u0435\u0434":"125","\u0441\u043a\u0430":"126","\u0442\u0435\u043d":"127"," \u043a\u0430":"128"," \u0441\u043f":"129"," \u0458\u0430":"130","\u0430 \u0442":"131","\u0430\u0434\u0435":"132","\u0430\u0440\u0442":"133","\u0435 \u0433":"134","\u0435 \u0438":"135","\u043a\u0430\u0442":"136","\u043b\u0430\u0441":"137","\u043d\u0438\u043e":"138","\u043e \u0441":"139","\u0440\u0438 ":"140"," \u0431\u0430":"141"," \u0431\u0438":"142","\u0430\u0432\u0430":"143","\u0430\u0442\u0435":"144","\u0432\u043d\u0438":"145","\u0434 \u043d":"146","\u0434\u0435\u043d":"147","\u0434\u043e\u0432":"148","\u0434\u0440\u0436":"149","\u0434\u0443\u0432":"150","\u0435 \u043e":"151","\u0435\u043d ":"152","\u0435\u0440\u0435":"153","\u0435\u0440\u0438":"154","\u0438 \u043f":"155","\u0438 \u0441":"156","\u0438\u043d\u0430":"157","\u043a\u043e\u0458":"158","\u043d\u0446\u0438":"159","\u043e \u043c":"160","\u043e \u043e":"161","\u043e\u0434\u043d":"162","\u043f\u043e\u0440":"163","\u0441\u043a\u0438":"164","\u0441\u043f\u043e":"165","\u0441\u0442\u0432":"166","\u0441\u0442\u0438":"167","\u0442\u0432\u043e":"168","\u0442\u0438 ":"169"," \u043e\u0431":"170"," \u043e\u0432":"171","\u0430 \u0431":"172","\u0430\u043b\u043d":"173","\u0430\u0440\u0430":"174","\u0431\u0430\u0440":"175","\u0435 \u043a":"176","\u0435\u0434 ":"177","\u0435\u043d\u0442":"178","\u0435\u0453\u0443":"179","\u0438 \u043e":"180","\u0438\u0438 ":"181","\u043c\u0435\u0453":"182","\u043e \u0434":"183","\u043e\u0458\u0430":"184","\u043f\u043e\u0442":"185","\u0440\u0430\u0437":"186","\u0440\u0430\u0448":"187","\u0441\u043f\u0440":"188","\u0441\u0442\u043e":"189","\u0442 \u0434":"190","\u0446\u0438 ":"191"," \u0431\u0435":"192"," \u0433\u0440":"193"," \u0434\u0440":"194"," \u0438\u0437":"195"," \u0441\u0442":"196","\u0430\u0430 ":"197","\u0431\u0438\u0434":"198","\u0432\u0435\u0434":"199","\u0433\u043b\u0430":"200","\u0435\u043a\u043e":"201","\u0435\u043d\u0434":"202","\u0435\u0441\u0435":"203","\u0435\u0442\u0441":"204","\u0437\u0430\u0446":"205","\u0438 \u0442":"206","\u0438\u0437\u0430":"207","\u0438\u043d\u0441":"208","\u0438\u0441\u0442":"209","\u043a\u0438 ":"210","\u043a\u043e\u0432":"211","\u043a\u043e\u043b":"212","\u043a\u0443 ":"213","\u043b\u0438\u0446":"214","\u043e \u0437":"215","\u043e \u0438":"216","\u043e\u0432\u0430":"217","\u043e\u043b\u043a":"218","\u043e\u0440\u0435":"219","\u043e\u0440\u0438":"220","\u043f\u043e\u0434":"221","\u0440\u0430\u045a":"222","\u0440\u0435\u0444":"223","\u0440\u0436\u0430":"224","\u0440\u043e\u0432":"225","\u0440\u0442\u0438":"226","\u0441\u043e ":"227","\u0442\u043e\u0440":"228","\u0444\u0435\u0440":"229","\u0446\u0435\u043d":"230","\u0446\u0438\u0442":"231"," \u0430 ":"232"," \u0432\u0440":"233"," \u0433\u043b":"234"," \u0434\u043f":"235"," \u043c\u043e":"236"," \u043d\u0438":"237"," \u043d\u043e":"238"," \u043e\u043f":"239"," \u043e\u0442":"240","\u0430 \u045c":"241","\u0430\u0431\u043e":"242","\u0430\u0434\u0430":"243","\u0430\u0441\u0430":"244","\u0430\u0448\u0430":"245","\u0431\u0430 ":"246","\u0431\u043e\u0442":"247","\u0432\u0430\u0430":"248","\u0432\u0430\u0442":"249","\u0432\u043e\u0442":"250","\u0433\u0438 ":"251","\u0433\u0440\u0430":"252","\u0434\u0435 ":"253","\u0434\u0438\u043d":"254","\u0434\u0443\u043c":"255","\u0435\u0432\u0440":"256","\u0435\u0434\u0443":"257","\u0435\u043d\u043e":"258","\u0435\u0440\u0430":"259","\u0435\u0441 ":"260","\u0435\u045a\u0435":"261","\u0436\u0435 ":"262","\u0437\u0430\u043a":"263","\u0438 \u0432":"264","\u0438\u043b\u0430":"265","\u0438\u0442\u0443":"266","\u043a\u043e\u0430":"267","\u043a\u043e\u0438":"268","\u043b\u0430\u043d":"269","\u043b\u043a\u0443":"270","\u043b\u043e\u0436":"271","\u043c\u043e\u0442":"272","\u043d\u0434\u0443":"273","\u043d\u0441\u0442":"274","\u043e \u0432":"275","\u043e\u0430 ":"276","\u043e\u0430\u043b":"277","\u043e\u0431\u0440":"278","\u043e\u0432 ":"279","\u043e\u0432\u0438":"280","\u043e\u0432\u043d":"281","\u043e\u0438 ":"282","\u043e\u0440 ":"283","\u043e\u0440\u043c":"284","\u043e\u0458 ":"285","\u0440\u0435\u0442":"286","\u0441\u0435\u0434":"287","\u0441\u0442 ":"288","\u0442\u0435\u0440":"289","\u0442\u0438\u0458":"290","\u0442\u043e\u0430":"291","\u0444\u043e\u0440":"292","\u0446\u0438\u0438":"293","\u0453\u0443 ":"294"," \u0430\u043b":"295"," \u0432\u0435":"296"," \u0432\u043c":"297"," \u0433\u0438":"298"," \u0434\u0443":"299"},"mongolian":{"\u044b\u043d ":"0"," \u0431\u0430":"1","\u0439\u043d ":"2","\u0431\u0430\u0439":"3","\u0438\u0439\u043d":"4","\u0443\u0443\u043b":"5"," \u0443\u043b":"6","\u0443\u043b\u0441":"7","\u0430\u043d ":"8"," \u0445\u0430":"9","\u043d\u0438\u0439":"10","\u043d \u0445":"11","\u0433\u0430\u0430":"12","\u0441\u044b\u043d":"13","\u0438\u0439 ":"14","\u043b\u0441\u044b":"15"," \u0431\u043e":"16","\u0439 \u0431":"17","\u044d\u043d ":"18","\u0430\u0445 ":"19","\u0431\u043e\u043b":"20","\u043e\u043b ":"21","\u043d \u0431":"22","\u043e\u043b\u043e":"23"," \u0445\u044d":"24","\u043e\u043d\u0433":"25","\u0433\u043e\u043b":"26","\u0433\u0443\u0443":"27","\u043d\u0433\u043e":"28","\u044b\u0433 ":"29","\u0436\u0438\u043b":"30"," \u043c\u043e":"31","\u043b\u0430\u0433":"32","\u043b\u043b\u0430":"33","\u043c\u043e\u043d":"34"," \u0442\u0454":"35"," \u0445\u0443":"36","\u0430\u0439\u0434":"37","\u043d\u044b ":"38","\u043e\u043d ":"39","\u0441\u0430\u043d":"40","\u0445\u0438\u0439":"41"," \u0430\u0436":"42"," \u043e\u0440":"43","\u043b \u0443":"44","\u043d \u0442":"45","\u0443\u043b\u0433":"46","\u0430\u0439\u0433":"47","\u0434\u043b\u044b":"48","\u0439\u0433 ":"49"," \u0437\u0430":"50","\u0434\u044d\u0441":"51","\u043d \u0430":"52","\u043d\u0434\u044d":"53","\u0443\u043b\u0430":"54","\u044d\u044d ":"55","\u0430\u0433\u0430":"56","\u0438\u0439\u0433":"57","v\u0439 ":"58","\u0430\u0430 ":"59","\u0439 \u0430":"60","\u043b\u044b\u043d":"61","\u043d \u0437":"62"," \u0430\u044e":"63"," \u0437\u0454":"64","\u0430\u0430\u0440":"65","\u0430\u0434 ":"66","\u0430\u0440 ":"67","\u0433v\u0439":"68","\u0437\u0454\u0432":"69","\u0430\u0436\u0438":"70","\u0430\u043b ":"71","\u0430\u044e\u0443":"72","\u0433 \u0445":"73","\u043b\u0433v":"74","\u043b\u0436 ":"75","\u0441\u043d\u0438":"76","\u044d\u0441\u043d":"77","\u044e\u0443\u043b":"78","\u0439\u0434\u043b":"79","\u043b\u044b\u0433":"80","\u043d\u0445\u0438":"81","\u0443\u0443\u0434":"82","\u0445\u0430\u043c":"83"," \u043d\u044d":"84"," \u0441\u0430":"85","\u0433\u0438\u0439":"86","\u043b\u0430\u0445":"87","\u043b\u0454\u043b":"88","\u0440\u0454\u043d":"89","\u0454\u0433\u0447":"90"," \u0442\u0430":"91","\u0438\u043b\u043b":"92","\u043b\u0438\u0439":"93","\u043b\u044d\u0445":"94","\u0440\u0438\u0439":"95","\u044d\u0445 ":"96"," \u0435\u0440":"97"," \u044d\u0440":"98","\u0432\u043b\u0454":"99","\u0435\u0440\u0454":"100","\u0438\u0439\u043b":"101","\u043b\u043e\u043d":"102","\u043b\u0454\u0433":"103","\u0454\u0432\u043b":"104","\u0454\u043d\u0445":"105"," \u0445\u043e":"106","\u0430\u0440\u0438":"107","\u0438\u0445 ":"108","\u0445\u0430\u043d":"109","\u044d\u0440 ":"110","\u0454\u043d ":"111","vv\u043b":"112","\u0436 \u0431":"113","\u0442\u044d\u0439":"114","\u0445 \u0445":"115","\u044d\u0440\u0445":"116"," v\u043d":"117"," \u043d\u044c":"118","v\u043d\u0434":"119","\u0430\u043b\u0442":"120","\u0439\u043b\u0454":"121","\u043d\u044c ":"122","\u0442\u0454\u0440":"123"," \u0433\u0430":"124"," \u0441\u0443":"125","\u0430\u0430\u043d":"126","\u0434\u0430\u0430":"127","\u0438\u043b\u0446":"128","\u0439\u0433\u0443":"129","\u043b \u0430":"130","\u043b\u0430\u0430":"131","\u043d \u043d":"132","\u0440\u0443\u0443":"133","\u044d\u0439 ":"134"," \u0442\u043e":"135","\u043d \u0441":"136","\u0440\u0438\u043b":"137","\u0454\u0440\u0438":"138","\u0430\u0430\u0433":"139","\u0433\u0447 ":"140","\u043b\u044d\u044d":"141","\u043d \u043e":"142","\u0440\u044d\u0433":"143","\u0441\u0443\u0443":"144","\u044d\u0440\u044d":"145","\u0457\u0457\u043b":"146"," y\u043d":"147"," \u0431\u0443":"148"," \u0434\u044d":"149"," \u043e\u043b":"150"," \u0442\u0443":"151"," \u0448\u0438":"152","y\u043d\u0434":"153","\u0430\u0448\u0438":"154","\u0433 \u0442":"155","\u0438\u0433 ":"156","\u0439\u043b ":"157","\u0445\u0430\u0440":"158","\u0448\u0438\u043d":"159","\u044d\u0433 ":"160","\u0454\u0440 ":"161"," \u0438\u0445":"162"," \u0445\u0454":"163"," \u0445\u0457":"164","\u0430\u043c ":"165","\u0430\u043d\u0433":"166","\u0438\u043d ":"167","\u0439\u0433\u0430":"168","\u043b\u0441\u0430":"169","\u043d v":"170","\u043d \u0435":"171","\u043d\u0430\u043b":"172","\u043d\u0434 ":"173","\u0445\u0443\u0443":"174","\u0446\u0430\u0430":"175","\u044d\u0434 ":"176","\u044d\u044d\u0440":"177","\u0454\u043b ":"178","v\u0439\u043b":"179","\u0430\u0434\u0430":"180","\u0430\u0439\u043d":"181","\u0430\u043b\u0430":"182","\u0430\u043c\u0442":"183","\u0433\u0430\u0445":"184","\u0434 \u0445":"185","\u0434\u0430\u043b":"186","\u0437\u0430\u0440":"187","\u043b \u0431":"188","\u043b\u0430\u043d":"189","\u043d \u0434":"190","\u0441\u044d\u043d":"191","\u0443\u043b\u043b":"192","\u0445 \u0431":"193","\u0445\u044d\u0440":"194"," \u0431v":"195"," \u0434\u0430":"196"," \u0437\u043e":"197","v\u0440\u044d":"198","\u0430\u0430\u0434":"199","\u0433\u044d\u044d":"200","\u043b\u044d\u043d":"201","\u043d \u0438":"202","\u043d \u044d":"203","\u043d\u0433\u0430":"204","\u043d\u044d ":"205","\u0442\u0430\u043b":"206","\u0442\u044b\u043d":"207","\u0445\u0443\u0440":"208","\u044d\u043b ":"209"," \u043d\u0430":"210"," \u043d\u0438":"211"," \u043e\u043d":"212","v\u043b\u044d":"213","\u0430\u0433 ":"214","\u0430\u0436 ":"215","\u0430\u0439 ":"216","\u0430\u0442\u0430":"217","\u0431\u0430\u0440":"218","\u0433 \u0431":"219","\u0433\u0430\u0434":"220","\u0433\u0457\u0439":"221","\u0439 \u0445":"222","\u043b\u0442 ":"223","\u043d \u043c":"224","\u043d\u0430 ":"225","\u043e\u0440\u043e":"226","\u0443\u043b\u044c":"227","\u0447\u0438\u043d":"228","\u044d\u0436 ":"229","\u044d\u043d\u044d":"230","\u044d\u044d\u0434":"231","\u0457\u0439 ":"232","\u0457\u043b\u044d":"233"," \u0431\u0438":"234"," \u0442\u044d":"235"," \u044d\u043d":"236","\u0430\u043d\u044b":"237","\u0434\u0438\u0439":"238","\u0434\u044d\u044d":"239","\u043b\u0430\u043b":"240","\u043b\u0433\u0430":"241","\u043b\u0434 ":"242","\u043b\u043e\u0433":"243","\u043b\u044c ":"244","\u043d \u0443":"245","\u043d \u0457":"246","\u0440 \u0431":"247","\u0440\u0430\u043b":"248","\u0441\u043e\u043d":"249","\u0442\u0430\u0439":"250","\u0443\u0434\u043b":"251","\u044d\u043b\u0442":"252","\u044d\u0440\u0433":"253","\u0454\u043b\u0454":"254"," v\u0439":"255"," \u0432 ":"256"," \u0433\u044d":"257"," \u0445v":"258","\u0430\u0440\u0430":"259","\u0431v\u0440":"260","\u0434 \u043d":"261","\u0434 \u043e":"262","\u043b \u0445":"263","\u043b\u0441 ":"264","\u043b\u0442\u044b":"265","\u043d \u0433":"266","\u043d\u044d\u0433":"267","\u043e\u0433\u0442":"268","\u043e\u043b\u044b":"269","\u043e\u0451\u0440":"270","\u0440 \u0442":"271","\u0440\u044d\u044d":"272","\u0442\u0430\u0432":"273","\u0442\u043e\u0433":"274","\u0443\u0443\u0440":"275","\u0445\u043e\u0451":"276","\u0445\u044d\u043b":"277","\u0445\u044d\u044d":"278","\u044d\u043b\u044d":"279","\u0451\u0440 ":"280"," \u0430\u0432":"281"," \u0430\u0441":"282"," \u0430\u0448":"283"," \u0434\u0443":"284"," \u0441\u043e":"285"," \u0447\u0438":"286"," \u044d\u0432":"287"," \u0454\u0440":"288","\u0430\u0430\u043b":"289","\u0430\u043b\u0434":"290","\u0430\u043c\u0436":"291","\u0430\u043d\u0434":"292","\u0430\u0441\u0443":"293","\u0432\u044d\u0440":"294","\u0433 \u0443":"295","\u0434\u0432\u044d":"296","\u0436vv":"297","\u043b\u0446\u0430":"298","\u043b\u044d\u043b":"299"},"nepali":{"\u0915\u094b ":"0","\u0915\u093e ":"1","\u092e\u093e ":"2","\u0939\u0930\u0941":"3"," \u0928\u0947":"4","\u0928\u0947\u092a":"5","\u092a\u093e\u0932":"6","\u0947\u092a\u093e":"7"," \u0938\u092e":"8","\u0932\u0947 ":"9"," \u092a\u094d":"10","\u092a\u094d\u0930":"11","\u0915\u093e\u0930":"12","\u093e \u0938":"13","\u090f\u0915\u094b":"14"," \u092d\u090f":"15"," \u091b ":"16"," \u092d\u093e":"17","\u094d\u0930\u092e":"18"," \u0917\u0930":"19","\u0930\u0941\u0915":"20"," \u0930 ":"21","\u092d\u093e\u0930":"22","\u093e\u0930\u0924":"23"," \u0915\u093e":"24"," \u0935\u093f":"25","\u092d\u090f\u0915":"26","\u093e\u0932\u0940":"27","\u0932\u0940 ":"28","\u093e \u092a":"29","\u0940\u0939\u0930":"30","\u093e\u0930\u094d":"31","\u094b \u091b":"32","\u0928\u093e ":"33","\u0930\u0941 ":"34","\u093e\u0932\u0915":"35","\u094d\u092f\u093e":"36"," \u092c\u093e":"37","\u090f\u0915\u093e":"38","\u0928\u0947 ":"39","\u0928\u094d\u0924":"40","\u093e \u092c":"41","\u093e\u0915\u094b":"42","\u093e\u0930 ":"43","\u093e \u092d":"44","\u093e\u0939\u0930":"45","\u094d\u0930\u094b":"46","\u0915\u094d\u0937":"47","\u0928\u094d ":"48","\u093e\u0930\u0940":"49"," \u0928\u093f":"50","\u093e \u0928":"51","\u0940 \u0938":"52"," \u0921\u0941":"53","\u0915\u094d\u0930":"54","\u091c\u0928\u093e":"55","\u092f\u094b ":"56","\u093e \u091b":"57","\u0947\u0935\u093e":"58","\u094d\u0924\u093e":"59"," \u0930\u093e":"60","\u0924\u094d\u092f":"61","\u0928\u094d\u0926":"62","\u0939\u0941\u0928":"63","\u093e \u0915":"64","\u093e\u092e\u093e":"65","\u0940 \u0928":"66","\u094d\u0926\u093e":"67"," \u0938\u0947":"68","\u091b\u0928\u094d":"69","\u092e\u094d\u092c":"70","\u0930\u094b\u0924":"71","\u0938\u0947\u0935":"72","\u0938\u094d\u0924":"73","\u0938\u094d\u0930":"74","\u0947\u0915\u093e":"75","\u094d\u0924 ":"76"," \u092c\u0940":"77"," \u0939\u0941":"78","\u0915\u094d\u0924":"79","\u0924\u094d\u0930":"80","\u0930\u0924 ":"81","\u0930\u094d\u0928":"82","\u0930\u094d\u092f":"83","\u093e \u0930":"84","\u093e\u0915\u093e":"85","\u0941\u0915\u094b":"86"," \u090f\u0915":"87"," \u0938\u0902":"88"," \u0938\u0941":"89","\u092c\u0940\u092c":"90","\u092c\u0940\u0938":"91","\u0932\u0915\u094b":"92","\u0938\u094d\u092f":"93","\u0940\u092c\u0940":"94","\u0940\u0938\u0940":"95","\u0947\u0915\u094b":"96","\u094b \u0938":"97","\u094d\u092f\u0915":"98"," \u091b\u0928":"99"," \u091c\u0928":"100"," \u092c\u093f":"101"," \u092e\u0941":"102"," \u0938\u094d":"103","\u0917\u0930\u094d":"104","\u0924\u093e\u0939":"105","\u0928\u094d\u0927":"106","\u092c\u093e\u0930":"107","\u092e\u0928\u094d":"108","\u092e\u0938\u094d":"109","\u0930\u0941\u0932":"110","\u0932\u093e\u0908":"111","\u093e \u0935":"112","\u093e\u0908 ":"113","\u093e\u0932 ":"114","\u093f\u0915\u093e":"115"," \u0924\u094d":"116"," \u092e\u093e":"117"," \u092f\u0938":"118"," \u0930\u0941":"119","\u0924\u093e\u0915":"120","\u092c\u0928\u094d":"121","\u0930 \u092c":"122","\u0930\u0923 ":"123","\u0930\u0941\u092a":"124","\u0930\u0947\u0915":"125","\u0937\u094d\u091f":"126","\u0938\u092e\u094d":"127","\u0938\u0940 ":"128","\u093e\u090f\u0915":"129","\u0941\u0915\u093e":"130","\u0941\u0915\u094d":"131"," \u0905\u0927":"132"," \u0905\u0928":"133"," \u0924\u0925":"134"," \u0925\u093f":"135"," \u0926\u0947":"136"," \u092a\u0930":"137"," \u092c\u0948":"138","\u0924\u0925\u093e":"139","\u0924\u093e ":"140","\u0926\u093e ":"141","\u0926\u094d\u0926":"142","\u0928\u0940 ":"143","\u092c\u093e\u091f":"144","\u092f\u0915\u094d":"145","\u0930\u0940 ":"146","\u0930\u0940\u0939":"147","\u0930\u094d\u092e":"148","\u0932\u0915\u093e":"149","\u0938\u092e\u0938":"150","\u093e \u0905":"151","\u093e \u090f":"152","\u093e\u091f ":"153","\u093f\u092f ":"154","\u094b \u092a":"155","\u094b \u092e":"156","\u094d\u0928 ":"157","\u094d\u0928\u0947":"158","\u094d\u0937\u093e":"159"," \u092a\u093e":"160"," \u092f\u094b":"161"," \u0939\u093e":"162","\u0905\u0927\u093f":"163","\u0921\u0941\u0935":"164","\u0924 \u092d":"165","\u0924 \u0938":"166","\u0925\u093e ":"167","\u0927\u093f\u0915":"168","\u092a\u092e\u093e":"169","\u092c\u0948\u0920":"170","\u092e\u0941\u0926":"171","\u092f\u093e ":"172","\u092f\u0941\u0915":"173","\u0930 \u0928":"174","\u0930\u0924\u093f":"175","\u0935\u093e\u0928":"176","\u0938\u093e\u0930":"177","\u093e \u0906":"178","\u093e \u091c":"179","\u093e \u0939":"180","\u0941\u0926\u094d":"181","\u0941\u092a\u092e":"182","\u0941\u0932\u0947":"183","\u0941\u0935\u093e":"184","\u0948\u0920\u0915":"185","\u094b \u092c":"186","\u094d\u0924\u0930":"187","\u094d\u092f ":"188","\u094d\u092f\u0938":"189"," \u0915\u094d":"190"," \u092e\u0928":"191"," \u0930\u0939":"192","\u091a\u093e\u0930":"193","\u0924\u093f\u092f":"194","\u0926\u0948 ":"195","\u0928\u093f\u0930":"196","\u0928\u0941 ":"197","\u092a\u0930\u094d":"198","\u0930\u0915\u094d":"199","\u0930\u094d\u0926":"200","\u0938\u092e\u093e":"201","\u0938\u0941\u0930":"202","\u093e\u0909\u0928":"203","\u093e\u0928 ":"204","\u093e\u0928\u092e":"205","\u093e\u0930\u0923":"206","\u093e\u0932\u0947":"207","\u093f \u092c":"208","\u093f\u092f\u094b":"209","\u0941\u0928\u094d":"210","\u0941\u0930\u0915":"211","\u094d\u0924\u094d":"212","\u094d\u092c\u0928":"213","\u094d\u0930\u093e":"214","\u094d\u0937 ":"215"," \u0906\u0930":"216"," \u091c\u0932":"217"," \u092c\u0947":"218"," \u092f\u093e":"219"," \u0938\u093e":"220","\u0906\u090f\u0915":"221","\u090f\u0915 ":"222","\u0915\u0930\u094d":"223","\u091c\u0932\u0938":"224","\u0923\u0915\u093e":"225","\u0924 \u0930":"226","\u0926\u094d\u0930":"227","\u0927\u093e\u0928":"228","\u0927\u093f ":"229","\u0928\u0915\u093e":"230","\u0928\u092e\u093e":"231","\u0928\u093f ":"232","\u092e\u092e\u093e":"233","\u0930\u092e ":"234","\u0930\u0939\u0947":"235","\u0930\u093e\u091c":"236","\u0932\u0938\u094d":"237","\u0932\u093e ":"238","\u0935\u093e\u0930":"239","\u0938\u0915\u093e":"240","\u0939\u093f\u0932":"241","\u0939\u0947\u0915":"242","\u093e \u0924":"243","\u093e\u0930\u0947":"244","\u093f\u0928\u094d":"245","\u093f\u0938\u094d":"246","\u0947 \u0938":"247","\u094b \u0928":"248","\u094b \u0930":"249","\u094b\u0924 ":"250","\u094d\u0927\u093f":"251","\u094d\u092e\u0940":"252","\u094d\u0930\u0938":"253"," \u0926\u0941":"254"," \u092a\u0928":"255"," \u092c\u0924":"256"," \u092c\u0928":"257"," \u092d\u0928":"258","\u0902\u092f\u0941":"259","\u0906\u0930\u092e":"260","\u0916\u093f ":"261","\u0923\u094d\u0921":"262","\u0924\u0915\u093e":"263","\u0924\u093e\u0932":"264","\u0926\u0940 ":"265","\u0926\u0947\u0916":"266","\u0928\u093f\u092f":"267","\u092a\u0928\u093f":"268","\u092a\u094d\u0924":"269","\u092c\u0924\u093e":"270","\u092e\u0940 ":"271","\u092e\u094d\u092d":"272","\u0930 \u0938":"273","\u0930\u092e\u094d":"274","\u0932\u092e\u093e":"275","\u0935\u093f\u0936":"276","\u0937\u093e\u0915":"277","\u0938\u0902\u092f":"278","\u093e \u0921":"279","\u093e \u092e":"280","\u093e\u0928\u0915":"281","\u093e\u0932\u092e":"282","\u093f \u092d":"283","\u093f\u0924 ":"284","\u0940 \u092a":"285","\u0940 \u0930":"286","\u0941 \u092d":"287","\u0941\u0928\u0947":"288","\u0947 \u0917":"289","\u0947\u0916\u093f":"290","\u0947\u0930 ":"291","\u094b \u092d":"292","\u094b \u0935":"293","\u094b \u0939":"294","\u094d\u092d ":"295","\u094d\u0930 ":"296"," \u0924\u093e":"297"," \u0928\u092e":"298"," \u0928\u093e":"299"},"norwegian":{"er ":"0","en ":"1","et ":"2"," de":"3","det":"4"," i ":"5","for":"6","il ":"7"," fo":"8"," me":"9","ing":"10","om ":"11"," ha":"12"," og":"13","ter":"14"," er":"15"," ti":"16"," st":"17","og ":"18","til":"19","ne ":"20"," vi":"21","re ":"22"," en":"23"," se":"24","te ":"25","or ":"26","de ":"27","kke":"28","ke ":"29","ar ":"30","ng ":"31","r s":"32","ene":"33"," so":"34","e s":"35","der":"36","an ":"37","som":"38","ste":"39","at ":"40","ed ":"41","r i":"42"," av":"43"," in":"44","men":"45"," at":"46"," ko":"47"," p\u00e5":"48","har":"49"," si":"50","ere":"51","p\u00e5 ":"52","nde":"53","and":"54","els":"55","ett":"56","tte":"57","lig":"58","t s":"59","den":"60","t i":"61","ikk":"62","med":"63","n s":"64","rt ":"65","ser":"66","ska":"67","t e":"68","ker":"69","sen":"70","av ":"71","ler":"72","r a":"73","ten":"74","e f":"75","r e":"76","r t":"77","ede":"78","ig ":"79"," re":"80","han":"81","lle":"82","ner":"83"," bl":"84"," fr":"85","le ":"86"," ve":"87","e t":"88","lan":"89","mme":"90","nge":"91"," be":"92"," ik":"93"," om":"94"," \u00e5 ":"95","ell":"96","sel":"97","sta":"98","ver":"99"," et":"100"," sk":"101","nte":"102","one":"103","ore":"104","r d":"105","ske":"106"," an":"107"," la":"108","del":"109","gen":"110","nin":"111","r f":"112","r v":"113","se ":"114"," po":"115","ir ":"116","jon":"117","mer":"118","nen":"119","omm":"120","sjo":"121"," fl":"122"," sa":"123","ern":"124","kom":"125","r m":"126","r o":"127","ren":"128","vil":"129","ale":"130","es ":"131","n a":"132","t f":"133"," le":"134","bli":"135","e e":"136","e i":"137","e v":"138","het":"139","ye ":"140"," ir":"141","al ":"142","e o":"143","ide":"144","iti":"145","lit":"146","nne":"147","ran":"148","t o":"149","tal":"150","tat":"151","tt ":"152"," ka":"153","ans":"154","asj":"155","ge ":"156","inn":"157","kon":"158","lse":"159","pet":"160","t d":"161","vi ":"162"," ut":"163","ent":"164","eri":"165","oli":"166","r p":"167","ret":"168","ris":"169","sto":"170","str":"171","t a":"172"," ga":"173","all":"174","ape":"175","g s":"176","ill":"177","ira":"178","kap":"179","nn ":"180","opp":"181","r h":"182","rin":"183"," br":"184"," op":"185","e m":"186","ert":"187","ger":"188","ion":"189","kal":"190","lsk":"191","nes":"192"," gj":"193"," mi":"194"," pr":"195","ang":"196","e h":"197","e r":"198","elt":"199","enn":"200","i s":"201","ist":"202","jen":"203","kan":"204","lt ":"205","nal":"206","res":"207","tor":"208","ass":"209","dre":"210","e b":"211","e p":"212","mel":"213","n t":"214","nse":"215","ort":"216","per":"217","reg":"218","sje":"219","t p":"220","t v":"221"," hv":"222"," n\u00e5":"223"," va":"224","ann":"225","ato":"226","e a":"227","est":"228","ise":"229","isk":"230","oil":"231","ord":"232","pol":"233","ra ":"234","rak":"235","sse":"236","toi":"237"," gr":"238","ak ":"239","eg ":"240","ele":"241","g a":"242","ige":"243","igh":"244","m e":"245","n f":"246","n v":"247","ndr":"248","nsk":"249","rer":"250","t m":"251","und":"252","var":"253","\u00e5r ":"254"," he":"255"," no":"256"," ny":"257","end":"258","ete":"259","fly":"260","g i":"261","ghe":"262","ier":"263","ind":"264","int":"265","lin":"266","n d":"267","n p":"268","rne":"269","sak":"270","sie":"271","t b":"272","tid":"273"," al":"274"," pa":"275"," tr":"276","ag ":"277","dig":"278","e d":"279","e k":"280","ess":"281","hol":"282","i d":"283","lag":"284","led":"285","n e":"286","n i":"287","n o":"288","pri":"289","r b":"290","st ":"291"," fe":"292"," li":"293"," ry":"294","air":"295","ake":"296","d s":"297","eas":"298","egi":"299"},"pashto":{" \u062f ":"0","\u0627\u0624 ":"1"," \u0627\u0624":"2","\u0646\u0648 ":"3","\u06d0 \u062f":"4","\u0631\u0647 ":"5"," \u067e\u0647":"6","\u0646\u0647 ":"7","\u0686\u06d0 ":"8"," \u0686\u06d0":"9","\u067e\u0647 ":"10","\u0647 \u062f":"11","\u062a\u0647 ":"12","\u0648 \u0627":"13","\u0648\u0646\u0648":"14","\u0648 \u062f":"15"," \u0627\u0648":"16","\u0627\u0646\u0648":"17","\u0648\u0646\u0647":"18","\u0647 \u06a9":"19"," \u062f\u0627":"20","\u0647 \u0627":"21","\u062f\u06d0 ":"22","\u069a\u06d0 ":"23"," \u06a9\u06d0":"24","\u0627\u0646 ":"25","\u0644\u0648 ":"26","\u0647\u0645 ":"27","\u0648 \u0645":"28","\u06a9\u069a\u06d0":"29","\u0647 \u0645":"30","\u0649 \u0627":"31"," \u0646\u0648":"32"," \u062a\u0647":"33"," \u06a9\u069a":"34","\u0631\u0648\u0646":"35","\u06a9\u06d0 ":"36","\u062f\u0647 ":"37","\u0644\u0647 ":"38","\u0628\u0647 ":"39","\u0631\u0648 ":"40"," \u0647\u0645":"41","\u0647 \u0648":"42","\u0648\u0649 ":"43","\u0627\u0648 ":"44","\u062a\u0648\u0646":"45","\u062f\u0627 ":"46"," \u06a9\u0648":"47"," \u06a9\u0693":"48","\u0642\u0627\u0645":"49"," \u062a\u0631":"50","\u0631\u0627\u0646":"51","\u0647 \u067e":"52","\u06d0 \u0648":"53","\u06d0 \u067e":"54"," \u0628\u0647":"55"," \u062e\u0648":"56","\u062a\u0648 ":"57","\u062f \u062f":"58","\u062f \u0627":"59","\u0647 \u062a":"60","\u0648 \u067e":"61","\u064a\u0627 ":"62"," \u062e\u067e":"63"," \u062f\u0648":"64"," \u0631\u0627":"65"," \u0645\u0634":"66"," \u067e\u0631":"67","\u0627\u0631\u0648":"68","\u0631\u06d0 ":"69","\u0645 \u062f":"70","\u0645\u0634\u0631":"71"," \u0634\u0648":"72"," \u0648\u0631":"73","\u0627\u0631 ":"74","\u062f\u0649 ":"75"," \u0627\u062f":"76"," \u062f\u0649":"77"," \u0645\u0648":"78","\u062f \u067e":"79","\u0644\u064a ":"80","\u0648 \u06a9":"81"," \u0645\u0642":"82"," \u064a\u0648":"83","\u0624 \u062f":"84","\u062e\u067e\u0644":"85","\u0633\u0631\u0647":"86","\u0647 \u0686":"87","\u0648\u0631 ":"88"," \u062a\u0627":"89"," \u062f\u06d0":"90"," \u0631\u0648":"91"," \u0633\u0631":"92"," \u0645\u0644":"93"," \u06a9\u0627":"94","\u0624 \u0627":"95","\u0627\u0631\u0647":"96","\u0628\u0631\u0648":"97","\u0645\u0647 ":"98","\u0647 \u0628":"99","\u0648 \u062a":"100","\u067e\u069a\u062a":"101"," \u0628\u0627":"102"," \u062f\u063a":"103"," \u0642\u0628":"104"," \u0644\u0647":"105"," \u0648\u0627":"106"," \u067e\u0627":"107"," \u067e\u069a":"108","\u062f \u0645":"109","\u062f \u0647":"110","\u0644\u06d0 ":"111","\u0645\u0627\u062a":"112","\u0645\u0648 ":"113","\u0647 \u0647":"114","\u0648\u064a ":"115","\u06d0 \u0628":"116","\u06d0 \u06a9":"117"," \u062f\u0647":"118"," \u0642\u0627":"119","\u0627\u0644 ":"120","\u0627\u0645\u0627":"121","\u062f \u0646":"122","\u0642\u0628\u0631":"123","\u0647 \u0646":"124","\u067e\u0627\u0631":"125"," \u0627\u062b":"126"," \u0628\u064a":"127"," \u0644\u0627":"128"," \u0644\u0631":"129","\u0627\u062b\u0627":"130","\u062f \u062e":"131","\u062f\u0627\u0631":"132","\u0631\u064a\u062e":"133","\u0634\u0631\u0627":"134","\u0645\u0642\u0627":"135","\u0646\u06cd ":"136","\u0647 \u0631":"137","\u0647 \u0644":"138","\u0648\u0644\u0648":"139","\u064a\u0648 ":"140","\u06a9\u0648\u0645":"141"," \u062f\u062f":"142"," \u0644\u0648":"143"," \u0645\u062d":"144"," \u0645\u0631":"145"," \u0648\u0648":"146","\u0627\u062a\u0648":"147","\u0627\u0631\u064a":"148","\u0627\u0644\u0648":"149","\u0627\u0646\u062f":"150","\u062e\u0627\u0646":"151","\u062f \u062a":"152","\u0633\u06d0 ":"153","\u0644\u0649 ":"154","\u0646\u0648\u0631":"155","\u0648 \u0644":"156","\u064a \u0686":"157","\u0693\u064a ":"158","\u069a\u062a\u0648":"159","\u06d0 \u0644":"160"," \u062c\u0648":"161"," \u0633\u064a":"162","\u0627\u0645 ":"163","\u0628\u0627\u0646":"164","\u062a\u0627\u0631":"165","\u062a\u0631 ":"166","\u062b\u0627\u0631":"167","\u062e\u0648 ":"168","\u062f\u0648 ":"169","\u0631 \u06a9":"170","\u0644 \u062f":"171","\u0645\u0648\u0646":"172","\u0646\u062f\u06d0":"173","\u0648 \u0646":"174","\u0648\u0644 ":"175","\u0648\u0647 ":"176","\u0649 \u0648":"177","\u064a \u062f":"178","\u06d0 \u0627":"179","\u06d0 \u062a":"180","\u06d0 \u064a":"181"," \u062d\u06a9":"182"," \u062e\u0628":"183"," \u0646\u0647":"184"," \u067e\u0648":"185","\u0627 \u062f":"186","\u062a\u06d0 ":"187","\u062c\u0648\u0693":"188","\u062d\u06a9\u0645":"189","\u062d\u06a9\u0648":"190","\u062e\u0628\u0631":"191","\u062f\u0627\u0646":"192","\u0631 \u062f":"193","\u063a\u0647 ":"194","\u0642\u0627\u0641":"195","\u0645\u062d\u06a9":"196","\u0648\u0627\u0644":"197","\u0648\u0645\u062a":"198","\u0648\u064a\u0644":"199","\u0649 \u062f":"200","\u0649 \u0645":"201","\u064a\u0631\u0647":"202","\u067e\u0631 ":"203","\u06a9\u0648\u0644":"204","\u06d0 \u0647":"205"," \u062a\u064a":"206"," \u062e\u0627":"207"," \u0648\u06a9":"208"," \u064a\u0627":"209"," \u0681\u0627":"210","\u0624 \u0642":"211","\u0627\u0646\u06cd":"212","\u0628\u0649 ":"213","\u063a\u0648 ":"214","\u0647 \u062e":"215","\u0648 \u0628":"216","\u0648\u062f\u0627":"217","\u064a\u062f\u0648":"218","\u0693\u06d0 ":"219","\u06a9\u0627\u0644":"220"," \u0628\u0631":"221"," \u0642\u062f":"222"," \u0645\u064a":"223"," \u0648\u064a":"224"," \u06a9\u0631":"225","\u0624 \u0645":"226","\u0627\u062a ":"227","\u0627\u064a\u064a":"228","\u062a\u0649 ":"229","\u062a\u064a\u0627":"230","\u062a\u064a\u0631":"231","\u062e\u0648\u0627":"232","\u062f\u063a\u0648":"233","\u062f\u0645 ":"234","\u062f\u064a\u0645":"235","\u0631 \u0648":"236","\u0642\u062f\u064a":"237","\u0645 \u062e":"238","\u0645\u0627\u0646":"239","\u0645\u06d0 ":"240","\u0646\u064a\u0648":"241","\u0646\u0696 ":"242","\u0647 \u064a":"243","\u0648 \u0633":"244","\u0648 \u0686":"245","\u0648\u0627\u0646":"246","\u0648\u0631\u0648":"247","\u0648\u0646\u0696":"248","\u067e\u0648\u0631":"249","\u0693\u0647 ":"250","\u0693\u0648 ":"251","\u06cd \u062f":"252","\u06d0 \u0646":"253"," \u0627\u0647":"254"," \u0632\u064a":"255"," \u0633\u0648":"256"," \u0634\u064a":"257"," \u0647\u0631":"258"," \u0647\u063a":"259"," \u069a\u0627":"260","\u0627\u062a\u0644":"261","\u0627\u0642 ":"262","\u0627\u0646\u064a":"263","\u0628\u0631\u064a":"264","\u0628\u06d0 ":"265","\u062a \u0627":"266","\u062f \u0628":"267","\u062f \u0633":"268","\u0631 \u0645":"269","\u0631\u0649 ":"270","\u0639\u0631\u0627":"271","\u0644\u0627\u0646":"272","\u0645\u0649 ":"273","\u0646\u0649 ":"274","\u0648 \u062e":"275","\u0648\u0626 ":"276","\u0648\u0631\u06a9":"277","\u0648\u0631\u06d0":"278","\u0648\u0646 ":"279","\u0648\u06a9\u0693":"280","\u0649 \u0686":"281","\u064a\u0645\u0647":"282","\u064a\u06d0 ":"283","\u069a\u062a\u0646":"284","\u06a9\u0647 ":"285","\u06a9\u0693\u064a":"286","\u06d0 \u062e":"287","\u06d2 \u0634":"288"," \u062a\u062d":"289"," \u062a\u0648":"290"," \u062f\u0631":"291"," \u062f\u067e":"292"," \u0635\u0648":"293"," \u0639\u0631":"294"," \u0648\u0644":"295"," \u064a\u0624":"296"," \u067e\u06c0":"297"," \u0685\u0648":"298","\u0627 \u0627":"299"},"pidgin":{" de":"0"," we":"1"," di":"2","di ":"3","dem":"4","em ":"5","ay ":"6"," sa":"7","or ":"8","say":"9","ke ":"10","ey ":"11"," an":"12"," go":"13"," e ":"14"," to":"15"," ma":"16","e d":"17","wey":"18","for":"19","nd ":"20","to ":"21"," be":"22"," fo":"23","ake":"24","im ":"25"," pe":"26","le ":"27","go ":"28","ll ":"29","de ":"30","e s":"31","on ":"32","get":"33","ght":"34","igh":"35"," ri":"36","et ":"37","rig":"38"," ge":"39","y d":"40"," na":"41","mak":"42","t t":"43"," no":"44","and":"45","tin":"46","ing":"47","eve":"48","ri ":"49"," im":"50"," am":"51"," or":"52","am ":"53","be ":"54"," ev":"55"," ta":"56","ht ":"57","e w":"58"," li":"59","eri":"60","ng ":"61","ver":"62","all":"63","e f":"64","ers":"65","ntr":"66","ont":"67"," do":"68","r d":"69"," ko":"70"," ti":"71","an ":"72","kon":"73","per":"74","tri":"75","y e":"76","rso":"77","son":"78","no ":"79","ome":"80","is ":"81","do ":"82","ne ":"83","one":"84","ion":"85","m g":"86","i k":"87"," al":"88","bod":"89","i w":"90","odi":"91"," so":"92"," wo":"93","o d":"94","st ":"95","t r":"96"," of":"97","aim":"98","e g":"99","nai":"100"," co":"101","dis":"102","me ":"103","of ":"104"," wa":"105","e t":"106"," ar":"107","e l":"108","ike":"109","lik":"110","t a":"111","wor":"112","alk":"113","ell":"114","eop":"115","lk ":"116","opl":"117","peo":"118","ple":"119","re ":"120","tal":"121","any":"122","e a":"123","o g":"124","art":"125","cle":"126","i p":"127","icl":"128","rti":"129","the":"130","tic":"131","we ":"132","f d":"133","in ":"134"," mu":"135","e n":"136","e o":"137","mus":"138","n d":"139","na ":"140","o m":"141","ust":"142","wel":"143","e e":"144","her":"145","m d":"146","nt ":"147"," fi":"148","at ":"149","e b":"150","it ":"151","m w":"152","o t":"153","wan":"154","com":"155","da ":"156","fit":"157","m b":"158","so ":"159"," fr":"160","ce ":"161","er ":"162","o a":"163"," if":"164"," on":"165","ent":"166","if ":"167","ind":"168","kin":"169","l d":"170","man":"171","o s":"172"," se":"173","y a":"174","y m":"175"," re":"176","ee ":"177","k a":"178","t s":"179","ve ":"180","y w":"181"," ki":"182","eti":"183","men":"184","ta ":"185","y n":"186","d t":"187","dey":"188","e c":"189","i o":"190","ibo":"191","ld ":"192","m t":"193","n b":"194","o b":"195","ow ":"196","ree":"197","rio":"198","t d":"199"," hu":"200"," su":"201","en ":"202","hts":"203","ive":"204","m n":"205","n g":"206","ny ":"207","oth":"208","ts ":"209"," as":"210"," wh":"211","as ":"212","gom":"213","hum":"214","k s":"215","oda":"216","ork":"217","se ":"218","uma":"219","ut ":"220"," ba":"221"," ot":"222","ano":"223","m a":"224","m s":"225","nod":"226","om ":"227","r a":"228","r i":"229","rk ":"230"," fa":"231"," si":"232"," th":"233","ad ":"234","e m":"235","eac":"236","m m":"237","n w":"238","nob":"239","orl":"240","out":"241","own":"242","r s":"243","r w":"244","rib":"245","rld":"246","s w":"247","ure":"248","wn ":"249"," ow":"250","a d":"251","bad":"252","ch ":"253","fre":"254","gs ":"255","m k":"256","nce":"257","ngs":"258","o f":"259","obo":"260","rea":"261","sur":"262","y o":"263"," ab":"264"," un":"265","abo":"266","ach":"267","bou":"268","d m":"269","dat":"270","e p":"271","g w":"272","hol":"273","i m":"274","i r":"275","m f":"276","m o":"277","n o":"278","now":"279","ry ":"280","s a":"281","t o":"282","tay":"283","wet":"284"," ag":"285"," bo":"286"," da":"287"," pr":"288","arr":"289","ati":"290","d d":"291","d p":"292","i g":"293","i t":"294","liv":"295","ly ":"296","n a":"297","od ":"298","ok ":"299"},"polish":{"ie ":"0","nie":"1","em ":"2"," ni":"3"," po":"4"," pr":"5","dzi":"6"," na":"7","\u017ce ":"8","rze":"9","na ":"10","\u0142em":"11","wie":"12"," w ":"13"," \u017ce":"14","go ":"15"," by":"16","prz":"17","owa":"18","i\u0119 ":"19"," do":"20"," si":"21","owi":"22"," pa":"23"," za":"24","ch ":"25","ego":"26","a\u0142 ":"27","si\u0119":"28","ej ":"29","wa\u0142":"30","ym ":"31","ani":"32","a\u0142e":"33","to ":"34"," i ":"35"," to":"36"," te":"37","e p":"38"," je":"39"," z ":"40","czy":"41","by\u0142":"42","pan":"43","sta":"44","kie":"45"," ja":"46","do ":"47"," ch":"48"," cz":"49"," wi":"50","ia\u0142":"51","a p":"52","pow":"53"," mi":"54","li ":"55","eni":"56","zie":"57"," ta":"58"," wa":"59","\u0142o ":"60","a\u0107 ":"61","dy ":"62","ak ":"63","e w":"64"," a ":"65"," od":"66"," st":"67","nia":"68","rzy":"69","ied":"70"," kt":"71","odz":"72","cie":"73","cze":"74","ia ":"75","iel":"76","kt\u00f3":"77","o p":"78","t\u00f3r":"79","\u015bci":"80"," sp":"81"," wy":"82","jak":"83","tak":"84","zy ":"85"," mo":"86","a\u0142\u0119":"87","pro":"88","ski":"89","tem":"90","\u0142\u0119s":"91"," tr":"92","e m":"93","jes":"94","my ":"95"," ro":"96","edz":"97","eli":"98","iej":"99"," rz":"100","a n":"101","ale":"102","an ":"103","e s":"104","est":"105","le ":"106","o s":"107","i p":"108","ki ":"109"," co":"110","ada":"111","czn":"112","e t":"113","e z":"114","ent":"115","ny ":"116","pre":"117","rz\u0105":"118","y s":"119"," ko":"120"," o ":"121","ach":"122","am ":"123","e n":"124","o t":"125","oli":"126","pod":"127","zia":"128"," go":"129"," ka":"130","by ":"131","ieg":"132","ier":"133","no\u015b":"134","roz":"135","spo":"136","ych":"137","z\u0105d":"138"," mn":"139","acz":"140","adz":"141","bie":"142","cho":"143","mni":"144","o n":"145","ost":"146","pra":"147","ze ":"148","\u0142a ":"149"," so":"150","a m":"151","cza":"152","iem":"153","i\u0107 ":"154","obi":"155","y\u0142 ":"156","y\u0142o":"157"," mu":"158"," m\u00f3":"159","a t":"160","acj":"161","ci ":"162","e b":"163","ich":"164","kan":"165","mi ":"166","mie":"167","o\u015bc":"168","row":"169","zen":"170","zyd":"171"," al":"172"," re":"173","a w":"174","den":"175","edy":"176","i\u0142 ":"177","ko ":"178","o w":"179","rac":"180","\u015bmy":"181"," ma":"182"," ra":"183"," sz":"184"," ty":"185","e j":"186","isk":"187","ji ":"188","ka ":"189","m s":"190","no ":"191","o z":"192","rez":"193","wa ":"194","\u00f3w ":"195","\u0142ow":"196","\u015b\u0107 ":"197"," ob":"198","ech":"199","ecz":"200","ezy":"201","i w":"202","ja ":"203","kon":"204","m\u00f3w":"205","ne ":"206","ni ":"207","now":"208","nym":"209","pol":"210","pot":"211","yde":"212"," dl":"213"," sy":"214","a s":"215","aki":"216","ali":"217","dla":"218","icz":"219","ku ":"220","ocz":"221","st ":"222","str":"223","szy":"224","trz":"225","wia":"226","y p":"227","za ":"228"," wt":"229","chc":"230","esz":"231","iec":"232","im ":"233","la ":"234","o m":"235","sa ":"236","wa\u0107":"237","y n":"238","zac":"239","zec":"240"," gd":"241","a z":"242","ard":"243","co ":"244","dar":"245","e r":"246","ien":"247","m n":"248","m w":"249","mia":"250","mo\u017c":"251","raw":"252","rdz":"253","tan":"254","ted":"255","teg":"256","wi\u0142":"257","wte":"258","y z":"259","zna":"260","z\u0142o":"261","a r":"262","awi":"263","bar":"264","cji":"265","cz\u0105":"266","dow":"267","e\u017c ":"268","gdy":"269","iek":"270","je ":"271","o d":"272","ta\u0142":"273","wal":"274","wsz":"275","zed":"276","\u00f3wi":"277","\u0119sa":"278"," ba":"279"," lu":"280"," wo":"281","aln":"282","arn":"283","ba ":"284","dzo":"285","e c":"286","hod":"287","igi":"288","lig":"289","m p":"290","my\u015b":"291","o c":"292","oni":"293","rel":"294","sku":"295","ste":"296","y w":"297","yst":"298","z w":"299"},"portuguese":{"de ":"0"," de":"1","os ":"2","as ":"3","que":"4"," co":"5","\u00e3o ":"6","o d":"7"," qu":"8","ue ":"9"," a ":"10","do ":"11","ent":"12"," se":"13","a d":"14","s d":"15","e a":"16","es ":"17"," pr":"18","ra ":"19","da ":"20"," es":"21"," pa":"22","to ":"23"," o ":"24","em ":"25","con":"26","o p":"27"," do":"28","est":"29","nte":"30","\u00e7\u00e3o":"31"," da":"32"," re":"33","ma ":"34","par":"35"," te":"36","ara":"37","ida":"38"," e ":"39","ade":"40","is ":"41"," um":"42"," po":"43","a a":"44","a p":"45","dad":"46","no ":"47","te ":"48"," no":"49","a\u00e7\u00e3":"50","pro":"51","al ":"52","com":"53","e d":"54","s a":"55"," as":"56","a c":"57","er ":"58","men":"59","s e":"60","ais":"61","nto":"62","res":"63","a s":"64","ado":"65","ist":"66","s p":"67","tem":"68","e c":"69","e s":"70","ia ":"71","o s":"72","o a":"73","o c":"74","e p":"75","sta":"76","ta ":"77","tra":"78","ura":"79"," di":"80"," pe":"81","ar ":"82","e e":"83","ser":"84","uma":"85","mos":"86","se ":"87"," ca":"88","o e":"89"," na":"90","a e":"91","des":"92","ont":"93","por":"94"," in":"95"," ma":"96","ect":"97","o q":"98","ria":"99","s c":"100","ste":"101","ver":"102","cia":"103","dos":"104","ica":"105","str":"106"," ao":"107"," em":"108","das":"109","e t":"110","ito":"111","iza":"112","pre":"113","tos":"114"," n\u00e3":"115","ada":"116","n\u00e3o":"117","ess":"118","eve":"119","or ":"120","ran":"121","s n":"122","s t":"123","tur":"124"," ac":"125"," fa":"126","a r":"127","ens":"128","eri":"129","na ":"130","sso":"131"," si":"132"," \u00e9 ":"133","bra":"134","esp":"135","mo ":"136","nos":"137","ro ":"138","um ":"139","a n":"140","ao ":"141","ico":"142","liz":"143","min":"144","o n":"145","ons":"146","pri":"147","ten":"148","tic":"149","\u00f5es":"150"," tr":"151","a m":"152","aga":"153","e n":"154","ili":"155","ime":"156","m a":"157","nci":"158","nha":"159","nta":"160","spe":"161","tiv":"162","am ":"163","ano":"164","arc":"165","ass":"166","cer":"167","e o":"168","ece":"169","emo":"170","ga ":"171","o m":"172","rag":"173","so ":"174","s\u00e3o":"175"," au":"176"," os":"177"," sa":"178","ali":"179","ca ":"180","ema":"181","emp":"182","ici":"183","ido":"184","inh":"185","iss":"186","l d":"187","la ":"188","lic":"189","m c":"190","mai":"191","onc":"192","pec":"193","ram":"194","s q":"195"," ci":"196"," en":"197"," fo":"198","a o":"199","ame":"200","car":"201","co ":"202","der":"203","eir":"204","ho ":"205","io ":"206","om ":"207","ora":"208","r a":"209","sen":"210","ter":"211"," br":"212"," ex":"213","a u":"214","cul":"215","dev":"216","e u":"217","ha ":"218","mpr":"219","nce":"220","oca":"221","ove":"222","rio":"223","s o":"224","sa ":"225","sem":"226","tes":"227","uni":"228","ven":"229","za\u00e7":"230","\u00e7\u00f5e":"231"," ad":"232"," al":"233"," an":"234"," mi":"235"," mo":"236"," ve":"237"," \u00e0 ":"238","a i":"239","a q":"240","ala":"241","amo":"242","bli":"243","cen":"244","col":"245","cos":"246","cto":"247","e m":"248","e v":"249","ede":"250","g\u00e1s":"251","ias":"252","ita":"253","iva":"254","ndo":"255","o t":"256","ore":"257","r d":"258","ral":"259","rea":"260","s f":"261","sid":"262","tro":"263","vel":"264","vid":"265","\u00e1s ":"266"," ap":"267"," ar":"268"," ce":"269"," ou":"270"," p\u00fa":"271"," so":"272"," vi":"273","a f":"274","act":"275","arr":"276","bil":"277","cam":"278","e f":"279","e i":"280","el ":"281","for":"282","lem":"283","lid":"284","lo ":"285","m d":"286","mar":"287","nde":"288","o o":"289","omo":"290","ort":"291","per":"292","p\u00fab":"293","r u":"294","rei":"295","rem":"296","ros":"297","rre":"298","ssi":"299"},"romanian":{" de":"0"," \u00een":"1","de ":"2"," a ":"3","ul ":"4"," co":"5","\u00een ":"6","re ":"7","e d":"8","ea ":"9"," di":"10"," pr":"11","le ":"12","\u015fi ":"13","are":"14","at ":"15","con":"16","ui ":"17"," \u015fi":"18","i d":"19","ii ":"20"," cu":"21","e a":"22","lui":"23","ern":"24","te ":"25","cu ":"26"," la":"27","a c":"28","c\u0103 ":"29","din":"30","e c":"31","or ":"32","ulu":"33","ne ":"34","ter":"35","la ":"36","s\u0103 ":"37","tat":"38","tre":"39"," ac":"40"," s\u0103":"41","est":"42","st ":"43","t\u0103 ":"44"," ca":"45"," ma":"46"," pe":"47","cur":"48","ist":"49","m\u00e2n":"50","a d":"51","i c":"52","nat":"53"," ce":"54","i a":"55","ia ":"56","in ":"57","scu":"58"," mi":"59","ato":"60","a\u0163i":"61","ie ":"62"," re":"63"," se":"64","a a":"65","int":"66","ntr":"67","tru":"68","uri":"69","\u0103 a":"70"," fo":"71"," pa":"72","ate":"73","ini":"74","tul":"75","ent":"76","min":"77","pre":"78","pro":"79","a p":"80","e p":"81","e s":"82","ei ":"83","n\u0103 ":"84","par":"85","rna":"86","rul":"87","tor":"88"," in":"89"," ro":"90"," tr":"91"," un":"92","al ":"93","ale":"94","art":"95","ce ":"96","e e":"97","e \u00ee":"98","fos":"99","ita":"100","nte":"101","om\u00e2":"102","ost":"103","rom":"104","ru ":"105","str":"106","ver":"107"," ex":"108"," na":"109","a f":"110","lor":"111","nis":"112","rea":"113","rit":"114"," al":"115"," eu":"116"," no":"117","ace":"118","cer":"119","ile":"120","nal":"121","pri":"122","ri ":"123","sta":"124","ste":"125","\u0163ie":"126"," au":"127"," da":"128"," ju":"129"," po":"130","ar ":"131","au ":"132","ele":"133","ere":"134","eri":"135","ina":"136","n a":"137","n c":"138","res":"139","se ":"140","t a":"141","tea":"142"," c\u0103":"143"," do":"144"," fi":"145","a s":"146","at\u0103":"147","com":"148","e \u015f":"149","eur":"150","guv":"151","i s":"152","ice":"153","ili":"154","na ":"155","rec":"156","rep":"157","ril":"158","rne":"159","rti":"160","uro":"161","uve":"162","\u0103 p":"163"," ar":"164"," o ":"165"," su":"166"," vi":"167","dec":"168","dre":"169","oar":"170","ons":"171","pe ":"172","rii":"173"," ad":"174"," ge":"175","a m":"176","a r":"177","ain":"178","ali":"179","car":"180","cat":"181","ecu":"182","ene":"183","ept":"184","ext":"185","ilo":"186","iu ":"187","n p":"188","ori":"189","sec":"190","u p":"191","une":"192","\u0103 c":"193","\u015fti":"194","\u0163ia":"195"," ch":"196"," gu":"197","ai ":"198","ani":"199","cea":"200","e f":"201","isc":"202","l a":"203","lic":"204","liu":"205","mar":"206","nic":"207","nt ":"208","nul":"209","ris":"210","t c":"211","t p":"212","tic":"213","tid":"214","u a":"215","ucr":"216"," as":"217"," dr":"218"," fa":"219"," nu":"220"," pu":"221"," to":"222","cra":"223","dis":"224","en\u0163":"225","esc":"226","gen":"227","it ":"228","ivi":"229","l d":"230","n d":"231","nd ":"232","nu ":"233","ond":"234","pen":"235","ral":"236","riv":"237","rte":"238","sti":"239","t d":"240","ta ":"241","to ":"242","uni":"243","xte":"244","\u00e2nd":"245","\u00eens":"246","\u0103 s":"247"," bl":"248"," st":"249"," uc":"250","a b":"251","a i":"252","a l":"253","air":"254","ast":"255","bla":"256","bri":"257","che":"258","duc":"259","dul":"260","e m":"261","eas":"262","edi":"263","esp":"264","i l":"265","i p":"266","ica":"267","ic\u0103":"268","ir ":"269","iun":"270","jud":"271","lai":"272","lul":"273","mai":"274","men":"275","ni ":"276","pus":"277","put":"278","ra ":"279","rai":"280","rop":"281","sil":"282","ti ":"283","tra":"284","u s":"285","ua ":"286","ude":"287","urs":"288","\u00e2n ":"289","\u00eent":"290","\u0163\u0103 ":"291"," lu":"292"," mo":"293"," s ":"294"," sa":"295"," sc":"296","a u":"297","an ":"298","atu":"299"},"russian":{" \u043d\u0430":"0"," \u043f\u0440":"1","\u0442\u043e ":"2"," \u043d\u0435":"3","\u043b\u0438 ":"4"," \u043f\u043e":"5","\u043d\u043e ":"6"," \u0432 ":"7","\u043d\u0430 ":"8","\u0442\u044c ":"9","\u043d\u0435 ":"10"," \u0438 ":"11"," \u043a\u043e":"12","\u043e\u043c ":"13","\u043f\u0440\u043e":"14"," \u0442\u043e":"15","\u0438\u0445 ":"16"," \u043a\u0430":"17","\u0430\u0442\u044c":"18","\u043e\u0442\u043e":"19"," \u0437\u0430":"20","\u0438\u0435 ":"21","\u043e\u0432\u0430":"22","\u0442\u0435\u043b":"23","\u0442\u043e\u0440":"24"," \u0434\u0435":"25","\u043e\u0439 ":"26","\u0441\u0442\u0438":"27"," \u043e\u0442":"28","\u0430\u0445 ":"29","\u043c\u0438 ":"30","\u0441\u0442\u0440":"31"," \u0431\u0435":"32"," \u0432\u043e":"33"," \u0440\u0430":"34","\u0430\u044f ":"35","\u0432\u0430\u0442":"36","\u0435\u0439 ":"37","\u0435\u0442 ":"38","\u0436\u0435 ":"39","\u0438\u0447\u0435":"40","\u0438\u044f ":"41","\u043e\u0432 ":"42","\u0441\u0442\u043e":"43"," \u043e\u0431":"44","\u0432\u0435\u0440":"45","\u0433\u043e ":"46","\u0438 \u0432":"47","\u0438 \u043f":"48","\u0438 \u0441":"49","\u0438\u0438 ":"50","\u0438\u0441\u0442":"51","\u043e \u0432":"52","\u043e\u0441\u0442":"53","\u0442\u0440\u0430":"54"," \u0442\u0435":"55","\u0435\u043b\u0438":"56","\u0435\u0440\u0435":"57","\u043a\u043e\u0442":"58","\u043b\u044c\u043d":"59","\u043d\u0438\u043a":"60","\u043d\u0442\u0438":"61","\u043e \u0441":"62","\u0440\u043e\u0440":"63","\u0441\u0442\u0432":"64","\u0447\u0435\u0441":"65"," \u0431\u043e":"66"," \u0432\u0435":"67"," \u0434\u0430":"68"," \u0438\u043d":"69"," \u043d\u043e":"70"," \u0441 ":"71"," \u0441\u043e":"72"," \u0441\u043f":"73"," \u0441\u0442":"74"," \u0447\u0442":"75","\u0430\u043b\u0438":"76","\u0430\u043c\u0438":"77","\u0432\u0438\u0434":"78","\u0434\u0435\u0442":"79","\u0435 \u043d":"80","\u0435\u043b\u044c":"81","\u0435\u0441\u043a":"82","\u0435\u0441\u0442":"83","\u0437\u0430\u043b":"84","\u0438 \u043d":"85","\u0438\u0432\u0430":"86","\u043a\u043e\u043d":"87","\u043e\u0433\u043e":"88","\u043e\u0434\u043d":"89","\u043e\u0436\u043d":"90","\u043e\u043b\u044c":"91","\u043e\u0440\u0438":"92","\u0440\u043e\u0432":"93","\u0441\u043a\u043e":"94","\u0441\u044f ":"95","\u0442\u0435\u0440":"96","\u0447\u0442\u043e":"97"," \u043c\u043e":"98"," \u0441\u0430":"99"," \u044d\u0442":"100","\u0430\u043d\u0442":"101","\u0432\u0441\u0435":"102","\u0435\u0440\u0440":"103","\u0435\u0441\u043b":"104","\u0438\u0434\u0435":"105","\u0438\u043d\u0430":"106","\u0438\u043d\u043e":"107","\u0438\u0440\u043e":"108","\u0438\u0442\u0435":"109","\u043a\u0430 ":"110","\u043a\u043e ":"111","\u043a\u043e\u043b":"112","\u043a\u043e\u043c":"113","\u043b\u0430 ":"114","\u043d\u0438\u044f":"115","\u043e \u0442":"116","\u043e\u043b\u043e":"117","\u0440\u0430\u043d":"118","\u0440\u0435\u0434":"119","\u0441\u044c ":"120","\u0442\u0438\u0432":"121","\u0442\u0438\u0447":"122","\u044b\u0445 ":"123"," \u0432\u0438":"124"," \u0432\u0441":"125"," \u0433\u043e":"126"," \u043c\u0430":"127"," \u0441\u043b":"128","\u0430\u043a\u043e":"129","\u0430\u043d\u0438":"130","\u0430\u0441\u0442":"131","\u0431\u0435\u0437":"132","\u0434\u0435\u043b":"133","\u0435 \u0434":"134","\u0435 \u043f":"135","\u0435\u043c ":"136","\u0436\u043d\u043e":"137","\u0438 \u0434":"138","\u0438\u043a\u0430":"139","\u043a\u0430\u0437":"140","\u043a\u0430\u043a":"141","\u043a\u0438 ":"142","\u043d\u043e\u0441":"143","\u043e \u043d":"144","\u043e\u043f\u0430":"145","\u043f\u0440\u0438":"146","\u0440\u0440\u043e":"147","\u0441\u043a\u0438":"148","\u0442\u0438 ":"149","\u0442\u043e\u0432":"150","\u044b\u0435 ":"151"," \u0432\u044b":"152"," \u0434\u043e":"153"," \u043c\u0435":"154"," \u043d\u0438":"155"," \u043e\u0434":"156"," \u0440\u043e":"157"," \u0441\u0432":"158"," \u0447\u0438":"159","\u0430 \u043d":"160","\u0430\u0435\u0442":"161","\u0430\u0437\u0430":"162","\u0430\u0442\u0435":"163","\u0431\u0435\u0441":"164","\u0432 \u043f":"165","\u0432\u0430 ":"166","\u0435 \u0432":"167","\u0435 \u043c":"168","\u0435 \u0441":"169","\u0435\u0437 ":"170","\u0435\u043d\u0438":"171","\u0437\u0430 ":"172","\u0437\u043d\u0430":"173","\u0438\u043d\u0438":"174","\u043a\u0430\u043c":"175","\u043a\u0430\u0445":"176","\u043a\u0442\u043e":"177","\u043b\u043e\u0432":"178","\u043c\u0435\u0440":"179","\u043c\u043e\u0436":"180","\u043d\u0430\u043b":"181","\u043d\u0438\u0446":"182","\u043d\u044b ":"183","\u043d\u044b\u043c":"184","\u043e\u0440\u0430":"185","\u043e\u0440\u043e":"186","\u043e\u0442 ":"187","\u043f\u043e\u0440":"188","\u0440\u0430\u0432":"189","\u0440\u0435\u0441":"190","\u0440\u0438\u0441":"191","\u0440\u043e\u0441":"192","\u0441\u043a\u0430":"193","\u0442 \u043d":"194","\u0442\u043e\u043c":"195","\u0447\u0438\u0442":"196","\u0448\u043a\u043e":"197"," \u0431\u044b":"198"," \u043e ":"199"," \u0442\u0440":"200"," \u0443\u0436":"201"," \u0447\u0443":"202"," \u0448\u043a":"203","\u0430 \u0431":"204","\u0430 \u0432":"205","\u0430 \u0440":"206","\u0430\u0431\u0438":"207","\u0430\u043b\u0430":"208","\u0430\u043b\u043e":"209","\u0430\u043b\u044c":"210","\u0430\u043d\u043d":"211","\u0430\u0442\u0438":"212","\u0431\u0438\u043d":"213","\u0432\u0435\u0441":"214","\u0432\u043d\u043e":"215","\u0432\u043e ":"216","\u0432\u0448\u0438":"217","\u0434\u0430\u043b":"218","\u0434\u0430\u0442":"219","\u0434\u043d\u043e":"220","\u0435 \u0437":"221","\u0435\u0433\u043e":"222","\u0435\u043b\u0435":"223","\u0435\u043d\u043d":"224","\u0435\u043d\u0442":"225","\u0435\u0442\u0435":"226","\u0438 \u043e":"227","\u0438\u043b\u0438":"228","\u0438\u0441\u044c":"229","\u0438\u0442 ":"230","\u0438\u0446\u0438":"231","\u043a\u043e\u0432":"232","\u043b\u0435\u043d":"233","\u043b\u044c\u043a":"234","\u043c\u0435\u043d":"235","\u043c\u044b ":"236","\u043d\u0435\u0442":"237","\u043d\u0438 ":"238","\u043d\u043d\u044b":"239","\u043d\u043e\u0433":"240","\u043d\u043e\u0439":"241","\u043d\u043e\u043c":"242","\u043e \u043f":"243","\u043e\u0431\u043d":"244","\u043e\u0432\u0435":"245","\u043e\u0432\u043d":"246","\u043e\u0440\u044b":"247","\u043f\u0435\u0440":"248","\u043f\u043e ":"249","\u043f\u0440\u0430":"250","\u043f\u0440\u0435":"251","\u0440\u0430\u0437":"252","\u0440\u043e\u043f":"253","\u0440\u044b ":"254","\u0441\u0435 ":"255","\u0441\u043b\u0438":"256","\u0441\u043e\u0432":"257","\u0442\u0440\u0435":"258","\u0442\u0441\u044f":"259","\u0443\u0440\u043e":"260","\u0446\u0435\u043b":"261","\u0447\u043d\u043e":"262","\u044c \u0432":"263","\u044c\u043a\u043e":"264","\u044c\u043d\u043e":"265","\u044d\u0442\u043e":"266","\u044e\u0442 ":"267","\u044f \u043d":"268"," \u0430\u043d":"269"," \u0435\u0441":"270"," \u0436\u0435":"271"," \u0438\u0437":"272"," \u043a\u0442":"273"," \u043c\u0438":"274"," \u043c\u044b":"275"," \u043f\u0435":"276"," \u0441\u0435":"277"," \u0446\u0435":"278","\u0430 \u043c":"279","\u0430 \u043f":"280","\u0430 \u0442":"281","\u0430\u0432\u0448":"282","\u0430\u0436\u0435":"283","\u0430\u043a ":"284","\u0430\u043b ":"285","\u0430\u043b\u0435":"286","\u0430\u043d\u0435":"287","\u0430\u0447\u0438":"288","\u0430\u044e\u0442":"289","\u0431\u043d\u0430":"290","\u0431\u043e\u043b":"291","\u0431\u044b ":"292","\u0432 \u0438":"293","\u0432 \u0441":"294","\u0432\u0430\u043d":"295","\u0433\u0440\u0430":"296","\u0434\u0430\u0436":"297","\u0434\u0435\u043d":"298","\u0435 \u043a":"299"},"serbian":{" \u043d\u0430":"0"," \u0458\u0435":"1"," \u043f\u043e":"2","\u0458\u0435 ":"3"," \u0438 ":"4"," \u043d\u0435":"5"," \u043f\u0440":"6","\u0433\u0430 ":"7"," \u0441\u0432":"8","\u043e\u0433 ":"9","\u0430 \u0441":"10","\u0438\u0445 ":"11","\u043d\u0430 ":"12","\u043a\u043e\u0458":"13","\u043e\u0433\u0430":"14"," \u0443 ":"15","\u0430 \u043f":"16","\u043d\u0435 ":"17","\u043d\u0438 ":"18","\u0442\u0438 ":"19"," \u0434\u0430":"20","\u043e\u043c ":"21"," \u0432\u0435":"22"," \u0441\u0440":"23","\u0438 \u0441":"24","\u0441\u043a\u043e":"25"," \u043e\u0431":"26","\u0430 \u043d":"27","\u0434\u0430 ":"28","\u0435 \u043d":"29","\u043d\u043e ":"30","\u043d\u043e\u0433":"31","\u043e \u0458":"32","\u043e\u0458 ":"33"," \u0437\u0430":"34","\u0432\u0430 ":"35","\u0435 \u0441":"36","\u0438 \u043f":"37","\u043c\u0430 ":"38","\u043d\u0438\u043a":"39","\u043e\u0431\u0440":"40","\u043e\u0432\u0430":"41"," \u043a\u043e":"42","\u0430 \u0438":"43","\u0434\u0438\u0458":"44","\u0435 \u043f":"45","\u043a\u0430 ":"46","\u043a\u043e ":"47","\u043a\u043e\u0433":"48","\u043e\u0441\u0442":"49","\u0441\u0432\u0435":"50","\u0441\u0442\u0432":"51","\u0441\u0442\u0438":"52","\u0442\u0440\u0430":"53","\u0435\u0434\u0438":"54","\u0438\u043c\u0430":"55","\u043f\u043e\u043a":"56","\u043f\u0440\u0430":"57","\u0440\u0430\u0437":"58","\u0442\u0435 ":"59"," \u0431\u043e":"60"," \u0432\u0438":"61"," \u0441\u0430":"62","\u0430\u0432\u043e":"63","\u0431\u0440\u0430":"64","\u0433\u043e\u0441":"65","\u0435 \u0438":"66","\u0435\u043b\u0438":"67","\u0435\u043d\u0438":"68","\u0437\u0430 ":"69","\u0438\u043a\u0438":"70","\u0438\u043e ":"71","\u043f\u0440\u0435":"72","\u0440\u0430\u0432":"73","\u0440\u0430\u0434":"74","\u0443 \u0441":"75","\u0458\u0443 ":"76","\u045a\u0430 ":"77"," \u0431\u0438":"78"," \u0434\u043e":"79"," \u0441\u0442":"80","\u0430\u0441\u0442":"81","\u0431\u043e\u0458":"82","\u0435\u0431\u043e":"83","\u0438 \u043d":"84","\u0438\u043c ":"85","\u043a\u0443 ":"86","\u043b\u0430\u043d":"87","\u043d\u0435\u0431":"88","\u043e\u0432\u043e":"89","\u043e\u0433\u043e":"90","\u043e\u0441\u043b":"91","\u043e\u0458\u0448":"92","\u043f\u0435\u0434":"93","\u0441\u0442\u0440":"94","\u0447\u0430\u0441":"95"," \u0433\u043e":"96"," \u043a\u0440":"97"," \u043c\u043e":"98"," \u0447\u043b":"99","\u0430 \u043c":"100","\u0430 \u043e":"101","\u0430\u043a\u043e":"102","\u0430\u0447\u0430":"103","\u0432\u0435\u043b":"104","\u0432\u0435\u0442":"105","\u0432\u043e\u0433":"106","\u0435\u0434\u0430":"107","\u0438\u0441\u0442":"108","\u0438\u0442\u0438":"109","\u0438\u0458\u0435":"110","\u043e\u043a\u043e":"111","\u0441\u043b\u043e":"112","\u0441\u0440\u0431":"113","\u0447\u043b\u0430":"114"," \u0431\u0435":"115"," \u043e\u0441":"116"," \u043e\u0442":"117"," \u0440\u0435":"118"," \u0441\u0435":"119","\u0430 \u0432":"120","\u0430\u043d ":"121","\u0431\u043e\u0433":"122","\u0431\u0440\u043e":"123","\u0432\u0435\u043d":"124","\u0433\u0440\u0430":"125","\u0435 \u043e":"126","\u0438\u043a\u0430":"127","\u0438\u0458\u0430":"128","\u043a\u0438\u0445":"129","\u043a\u043e\u043c":"130","\u043b\u0438 ":"131","\u043d\u0443 ":"132","\u043e\u0442\u0430":"133","\u043e\u0458\u043d":"134","\u043f\u043e\u0434":"135","\u0440\u0431\u0441":"136","\u0440\u0435\u0434":"137","\u0440\u043e\u0458":"138","\u0441\u0430 ":"139","\u0441\u043d\u0438":"140","\u0442\u0430\u0447":"141","\u0442\u0432\u0430":"142","\u0458\u0430 ":"143","\u0458\u0438 ":"144"," \u043a\u0430":"145"," \u043e\u0432":"146"," \u0442\u0440":"147","\u0430 \u0458":"148","\u0430\u0432\u0438":"149","\u0430\u0437 ":"150","\u0430\u043d\u043e":"151","\u0431\u0438\u043e":"152","\u0432\u0438\u043a":"153","\u0432\u043e ":"154","\u0433\u043e\u0432":"155","\u0434\u043d\u0438":"156","\u0435 \u0447":"157","\u0435\u0433\u043e":"158","\u0438 \u043e":"159","\u0438\u0432\u0430":"160","\u0438\u0432\u043e":"161","\u0438\u043a ":"162","\u0438\u043d\u0435":"163","\u0438\u043d\u0438":"164","\u0438\u043f\u0435":"165","\u043a\u0438\u043f":"166","\u043b\u0438\u043a":"167","\u043b\u043e ":"168","\u043d\u0430\u0448":"169","\u043d\u043e\u0441":"170","\u043e \u0442":"171","\u043e\u0434 ":"172","\u043e\u0434\u0438":"173","\u043e\u043d\u0430":"174","\u043e\u0458\u0438":"175","\u043f\u043e\u0447":"176","\u043f\u0440\u043e":"177","\u0440\u0430 ":"178","\u0440\u0438\u0441":"179","\u0440\u043e\u0434":"180","\u0440\u0441\u0442":"181","\u0441\u0435 ":"182","\u0441\u043f\u043e":"183","\u0441\u0442\u0430":"184","\u0442\u0438\u045b":"185","\u0443 \u0434":"186","\u0443 \u043d":"187","\u0443 \u043e":"188","\u0447\u0438\u043d":"189","\u0448\u0430 ":"190","\u0458\u0435\u0434":"191","\u0458\u043d\u0438":"192","\u045b\u0435 ":"193"," \u043c ":"194"," \u043c\u0435":"195"," \u043d\u0438":"196"," \u043e\u043d":"197"," \u043f\u0430":"198"," \u0441\u043b":"199"," \u0442\u0435":"200","\u0430 \u0443":"201","\u0430\u0432\u0430":"202","\u0430\u0432\u0435":"203","\u0430\u0432\u043d":"204","\u0430\u043d\u0430":"205","\u0430\u043e ":"206","\u0430\u0442\u0438":"207","\u0430\u0446\u0438":"208","\u0430\u0458\u0443":"209","\u0430\u045a\u0430":"210","\u0431\u0441\u043a":"211","\u0432\u043e\u0440":"212","\u0432\u043e\u0441":"213","\u0432\u0441\u043a":"214","\u0434\u0438\u043d":"215","\u0435 \u0443":"216","\u0435\u0434\u043d":"217","\u0435\u0437\u0438":"218","\u0435\u043a\u0430":"219","\u0435\u043d\u043e":"220","\u0435\u0442\u043e":"221","\u0435\u045a\u0430":"222","\u0436\u0438\u0432":"223","\u0438 \u0433":"224","\u0438 \u0438":"225","\u0438 \u043a":"226","\u0438 \u0442":"227","\u0438\u043a\u0443":"228","\u0438\u0447\u043a":"229","\u043a\u0438 ":"230","\u043a\u0440\u0441":"231","\u043b\u0430 ":"232","\u043b\u0430\u0432":"233","\u043b\u0438\u0442":"234","\u043c\u0435 ":"235","\u043c\u0435\u043d":"236","\u043d\u0430\u0446":"237","\u043e \u043d":"238","\u043e \u043f":"239","\u043e \u0443":"240","\u043e\u0434\u043d":"241","\u043e\u043b\u0438":"242","\u043e\u0440\u043d":"243","\u043e\u0441\u043d":"244","\u043e\u0441\u043f":"245","\u043e\u0447\u0435":"246","\u043f\u0441\u043a":"247","\u0440\u0435\u0447":"248","\u0440\u043f\u0441":"249","\u0441\u0432\u043e":"250","\u0441\u043a\u0438":"251","\u0441\u043b\u0430":"252","\u0441\u0440\u043f":"253","\u0441\u0443 ":"254","\u0442\u0430 ":"255","\u0442\u0430\u0432":"256","\u0442\u0432\u0435":"257","\u0443 \u0431":"258","\u0458\u0435\u0437":"259","\u045b\u0438 ":"260"," \u0435\u043d":"261"," \u0436\u0438":"262"," \u0438\u043c":"263"," \u043c\u0443":"264"," \u043e\u0434":"265"," \u0441\u0443":"266"," \u0442\u0430":"267"," \u0445\u0440":"268"," \u0447\u0430":"269"," \u0448\u0442":"270"," \u045a\u0435":"271","\u0430 \u0434":"272","\u0430 \u0437":"273","\u0430 \u043a":"274","\u0430 \u0442":"275","\u0430\u0434\u0443":"276","\u0430\u043b\u043e":"277","\u0430\u043d\u0438":"278","\u0430\u0441\u043e":"279","\u0432\u0430\u043d":"280","\u0432\u0430\u0447":"281","\u0432\u0430\u045a":"282","\u0432\u0435\u0434":"283","\u0432\u0438 ":"284","\u0432\u043d\u043e":"285","\u0432\u043e\u0442":"286","\u0432\u043e\u0458":"287","\u0432\u0443 ":"288","\u0434\u043e\u0431":"289","\u0434\u0440\u0443":"290","\u0434\u0441\u0435":"291","\u0434\u0443 ":"292","\u0435 \u0431":"293","\u0435 \u0434":"294","\u0435 \u043c":"295","\u0435\u043c ":"296","\u0435\u043c\u0430":"297","\u0435\u043d\u0442":"298","\u0435\u043d\u0446":"299"},"slovak":{" pr":"0"," po":"1"," ne":"2"," a ":"3","ch ":"4"," na":"5"," je":"6","n\u00ed ":"7","je ":"8"," do":"9","na ":"10","ova":"11"," v ":"12","to ":"13","ho ":"14","ou ":"15"," to":"16","ick":"17","ter":"18","\u017ee ":"19"," st":"20"," za":"21","ost":"22","\u00fdch":"23"," se":"24","pro":"25"," te":"26","e s":"27"," \u017ee":"28","a p":"29"," kt":"30","pre":"31"," by":"32"," o ":"33","se ":"34","kon":"35"," p\u0159":"36","a s":"37","n\u00e9 ":"38","n\u011b ":"39","sti":"40","ako":"41","ist":"42","mu ":"43","ame":"44","ent":"45","ky ":"46","la ":"47","pod":"48"," ve":"49"," ob":"50","om ":"51","vat":"52"," ko":"53","sta":"54","em ":"55","le ":"56","a v":"57","by ":"58","e p":"59","ko ":"60","eri":"61","kte":"62","sa ":"63","\u00e9ho":"64","e v":"65","mer":"66","tel":"67"," ak":"68"," sv":"69"," z\u00e1":"70","hla":"71","las":"72","lo ":"73"," ta":"74","a n":"75","ej ":"76","li ":"77","ne ":"78"," sa":"79","ak ":"80","ani":"81","ate":"82","ia ":"83","sou":"84"," so":"85","en\u00ed":"86","ie ":"87"," re":"88","ce ":"89","e n":"90","ori":"91","tic":"92"," vy":"93","a t":"94","k\u00e9 ":"95","nos":"96","o s":"97","str":"98","ti ":"99","uje":"100"," sp":"101","lov":"102","o p":"103","oli":"104","ov\u00e1":"105"," n\u00e1":"106","ale":"107","den":"108","e o":"109","ku ":"110","val":"111"," am":"112"," ro":"113"," si":"114","nie":"115","pol":"116","tra":"117"," al":"118","ali":"119","o v":"120","tor":"121"," mo":"122"," ni":"123","ci ":"124","o n":"125","\u00edm ":"126"," le":"127"," pa":"128"," s ":"129","al ":"130","ati":"131","ero":"132","ove":"133","rov":"134","v\u00e1n":"135","\u00edch":"136"," ja":"137"," z ":"138","ck\u00e9":"139","e z":"140"," od":"141","byl":"142","de ":"143","dob":"144","nep":"145","pra":"146","ric":"147","spo":"148","tak":"149"," v\u0161":"150","a a":"151","e t":"152","lit":"153","me ":"154","nej":"155","no ":"156","n\u00fdc":"157","o t":"158","a j":"159","e a":"160","en ":"161","est":"162","j\u00ed ":"163","mi ":"164","slo":"165","st\u00e1":"166","u v":"167","for":"168","nou":"169","pos":"170","p\u0159e":"171","si ":"172","tom":"173"," vl":"174","a z":"175","ly ":"176","orm":"177","ris":"178","za ":"179","z\u00e1k":"180"," k ":"181","at ":"182","ck\u00fd":"183","dno":"184","dos":"185","dy ":"186","jak":"187","kov":"188","ny ":"189","res":"190","ror":"191","sto":"192","van":"193"," op":"194","da ":"195","do ":"196","e j":"197","hod":"198","len":"199","n\u00fd ":"200","o z":"201","poz":"202","pri":"203","ran":"204","u s":"205"," ab":"206","aj ":"207","ast":"208","it ":"209","kto":"210","o o":"211","oby":"212","odo":"213","u p":"214","va ":"215","\u00e1n\u00ed":"216","\u00ed p":"217","\u00fdm ":"218"," in":"219"," mi":"220","a\u0165 ":"221","dov":"222","ka ":"223","nsk":"224","\u00e1ln":"225"," an":"226"," bu":"227"," sl":"228"," tr":"229","e m":"230","ech":"231","edn":"232","i n":"233","k\u00fdc":"234","n\u00edc":"235","ov ":"236","p\u0159\u00ed":"237","\u00ed a":"238"," aj":"239"," bo":"240","a d":"241","ide":"242","o a":"243","o d":"244","och":"245","pov":"246","svo":"247","\u00e9 s":"248"," kd":"249"," vo":"250"," v\u00fd":"251","bud":"252","ich":"253","il ":"254","ili":"255","ni ":"256","n\u00edm":"257","od ":"258","osl":"259","ouh":"260","rav":"261","roz":"262","st ":"263","stv":"264","tu ":"265","u a":"266","v\u00e1l":"267","y s":"268","\u00ed s":"269","\u00ed v":"270"," hl":"271"," li":"272"," me":"273","a m":"274","e b":"275","h s":"276","i p":"277","i s":"278","iti":"279","l\u00e1d":"280","nem":"281","nov":"282","opo":"283","uhl":"284","eno":"285","ens":"286","men":"287","nes":"288","obo":"289","te ":"290","ved":"291","vl\u00e1":"292","y n":"293"," ma":"294"," mu":"295"," v\u00e1":"296","bez":"297","byv":"298","cho":"299"},"slovene":{"je ":"0"," pr":"1"," po":"2"," je":"3"," v ":"4"," za":"5"," na":"6","pre":"7","da ":"8"," da":"9","ki ":"10","ti ":"11","ja ":"12","ne ":"13"," in":"14","in ":"15","li ":"16","no ":"17","na ":"18","ni ":"19"," bi":"20","jo ":"21"," ne":"22","nje":"23","e p":"24","i p":"25","pri":"26","o p":"27","red":"28"," do":"29","anj":"30","em ":"31","ih ":"32"," bo":"33"," ki":"34"," iz":"35"," se":"36"," so":"37","al ":"38"," de":"39","e v":"40","i s":"41","ko ":"42","bil":"43","ira":"44","ove":"45"," br":"46"," ob":"47","e b":"48","i n":"49","ova":"50","se ":"51","za ":"52","la ":"53"," ja":"54","ati":"55","so ":"56","ter":"57"," ta":"58","a s":"59","del":"60","e d":"61"," dr":"62"," od":"63","a n":"64","ar ":"65","jal":"66","ji ":"67","rit":"68"," ka":"69"," ko":"70"," pa":"71","a b":"72","ani":"73","e s":"74","er ":"75","ili":"76","lov":"77","o v":"78","tov":"79"," ir":"80"," ni":"81"," vo":"82","a j":"83","bi ":"84","bri":"85","iti":"86","let":"87","o n":"88","tan":"89","\u0161e ":"90"," le":"91"," te":"92","eni":"93","eri":"94","ita":"95","kat":"96","por":"97","pro":"98","ali":"99","ke ":"100","oli":"101","ov ":"102","pra":"103","ri ":"104","uar":"105","ve ":"106"," to":"107","a i":"108","a v":"109","ako":"110","arj":"111","ate":"112","di ":"113","do ":"114","ga ":"115","le ":"116","lo ":"117","mer":"118","o s":"119","oda":"120","oro":"121","pod":"122"," ma":"123"," mo":"124"," si":"125","a p":"126","bod":"127","e n":"128","ega":"129","ju ":"130","ka ":"131","lje":"132","rav":"133","ta ":"134","a o":"135","e t":"136","e z":"137","i d":"138","i v":"139","ila":"140","lit":"141","nih":"142","odo":"143","sti":"144","to ":"145","var":"146","ved":"147","vol":"148"," la":"149"," no":"150"," vs":"151","a d":"152","agu":"153","aja":"154","dej":"155","dnj":"156","eda":"157","gov":"158","gua":"159","jag":"160","jem":"161","kon":"162","ku ":"163","nij":"164","omo":"165","o\u010di":"166","pov":"167","rak":"168","rja":"169","sta":"170","tev":"171","a t":"172","aj ":"173","ed ":"174","eja":"175","ent":"176","ev ":"177","i i":"178","i o":"179","ijo":"180","ist":"181","ost":"182","ske":"183","str":"184"," ra":"185"," s ":"186"," tr":"187"," \u0161e":"188","arn":"189","bo ":"190","dr\u017e":"191","i j":"192","ilo":"193","izv":"194","jen":"195","lja":"196","nsk":"197","o d":"198","o i":"199","om ":"200","ora":"201","ovo":"202","raz":"203","r\u017ea":"204","tak":"205","va ":"206","ven":"207","\u017eav":"208"," me":"209"," \u010de":"210","ame":"211","avi":"212","e i":"213","e o":"214","eka":"215","gre":"216","i t":"217","ija":"218","il ":"219","ite":"220","kra":"221","lju":"222","mor":"223","nik":"224","o t":"225","obi":"226","odn":"227","ran":"228","re ":"229","sto":"230","stv":"231","udi":"232","v i":"233","van":"234"," am":"235"," sp":"236"," st":"237"," tu":"238"," ve":"239"," \u017ee":"240","ajo":"241","ale":"242","apo":"243","dal":"244","dru":"245","e j":"246","edn":"247","ejo":"248","elo":"249","est":"250","etj":"251","eva":"252","iji":"253","ik ":"254","im ":"255","itv":"256","mob":"257","nap":"258","nek":"259","pol":"260","pos":"261","rat":"262","ski":"263","ti\u010d":"264","tom":"265","ton":"266","tra":"267","tud":"268","tve":"269","v b":"270","vil":"271","vse":"272","\u010dit":"273"," av":"274"," gr":"275","a z":"276","ans":"277","ast":"278","avt":"279","dan":"280","e m":"281","eds":"282","for":"283","i z":"284","kot":"285","mi ":"286","nim":"287","o b":"288","o o":"289","od ":"290","odl":"291","oiz":"292","ot ":"293","par":"294","pot":"295","rje":"296","roi":"297","tem":"298","val":"299"},"somali":{"ka ":"0","ay ":"1","da ":"2"," ay":"3","aal":"4","oo ":"5","aan":"6"," ka":"7","an ":"8","in ":"9"," in":"10","ada":"11","maa":"12","aba":"13"," so":"14","ali":"15","bad":"16","add":"17","soo":"18"," na":"19","aha":"20","ku ":"21","ta ":"22"," wa":"23","yo ":"24","a s":"25","oma":"26","yaa":"27"," ba":"28"," ku":"29"," la":"30"," oo":"31","iya":"32","sha":"33","a a":"34","dda":"35","nab":"36","nta":"37"," da":"38"," ma":"39","nka":"40","uu ":"41","y i":"42","aya":"43","ha ":"44","raa":"45"," dh":"46"," qa":"47","a k":"48","ala":"49","baa":"50","doo":"51","had":"52","liy":"53","oom":"54"," ha":"55"," sh":"56","a d":"57","a i":"58","a n":"59","aar":"60","ee ":"61","ey ":"62","y k":"63","ya ":"64"," ee":"65"," iy":"66","aa ":"67","aaq":"68","gaa":"69","lam":"70"," bu":"71","a b":"72","a m":"73","ad ":"74","aga":"75","ama":"76","iyo":"77","la ":"78","a c":"79","a l":"80","een":"81","int":"82","she":"83","wax":"84","yee":"85"," si":"86"," uu":"87","a h":"88","aas":"89","alk":"90","dha":"91","gu ":"92","hee":"93","ii ":"94","ira":"95","mad":"96","o a":"97","o k":"98","qay":"99"," ah":"100"," ca":"101"," wu":"102","ank":"103","ash":"104","axa":"105","eed":"106","en ":"107","ga ":"108","haa":"109","n a":"110","n s":"111","naa":"112","nay":"113","o d":"114","taa":"115","u b":"116","uxu":"117","wux":"118","xuu":"119"," ci":"120"," do":"121"," ho":"122"," ta":"123","a g":"124","a u":"125","ana":"126","ayo":"127","dhi":"128","iin":"129","lag":"130","lin":"131","lka":"132","o i":"133","san":"134","u s":"135","una":"136","uun":"137"," ga":"138"," xa":"139"," xu":"140","aab":"141","abt":"142","aq ":"143","aqa":"144","ara":"145","arl":"146","caa":"147","cir":"148","eeg":"149","eel":"150","isa":"151","kal":"152","lah":"153","ney":"154","qaa":"155","rla":"156","sad":"157","sii":"158","u d":"159","wad":"160"," ad":"161"," ar":"162"," di":"163"," jo":"164"," ra":"165"," sa":"166"," u ":"167"," yi":"168","a j":"169","a q":"170","aad":"171","aat":"172","aay":"173","ah ":"174","ale":"175","amk":"176","ari":"177","as ":"178","aye":"179","bus":"180","dal":"181","ddu":"182","dii":"183","du ":"184","duu":"185","ed ":"186","ege":"187","gey":"188","hay":"189","hii":"190","ida":"191","ine":"192","joo":"193","laa":"194","lay":"195","mar":"196","mee":"197","n b":"198","n d":"199","n m":"200","no ":"201","o b":"202","o l":"203","oog":"204","oon":"205","rga":"206","sh ":"207","sid":"208","u q":"209","unk":"210","ush":"211","xa ":"212","y d":"213"," bi":"214"," gu":"215"," is":"216"," ke":"217"," lo":"218"," me":"219"," mu":"220"," qo":"221"," ug":"222","a e":"223","a o":"224","a w":"225","adi":"226","ado":"227","agu":"228","al ":"229","ant":"230","ark":"231","asa":"232","awi":"233","bta":"234","bul":"235","d a":"236","dag":"237","dan":"238","do ":"239","e s":"240","gal":"241","gay":"242","guu":"243","h e":"244","hal":"245","iga":"246","ihi":"247","iri":"248","iye":"249","ken":"250","lad":"251","lid":"252","lsh":"253","mag":"254","mun":"255","n h":"256","n i":"257","na ":"258","o n":"259","o w":"260","ood":"261","oor":"262","ora":"263","qab":"264","qor":"265","rab":"266","rit":"267","rta":"268","s o":"269","sab":"270","ska":"271","to ":"272","u a":"273","u h":"274","u u":"275","ud ":"276","ugu":"277","uls":"278","uud":"279","waa":"280","xus":"281","y b":"282","y q":"283","y s":"284","yad":"285","yay":"286","yih":"287"," aa":"288"," bo":"289"," br":"290"," go":"291"," ji":"292"," mi":"293"," of":"294"," ti":"295"," um":"296"," wi":"297"," xo":"298","a x":"299"},"spanish":{" de":"0","de ":"1"," la":"2","os ":"3","la ":"4","el ":"5","es ":"6"," qu":"7"," co":"8","e l":"9","as ":"10","que":"11"," el":"12","ue ":"13","en ":"14","ent":"15"," en":"16"," se":"17","nte":"18","res":"19","con":"20","est":"21"," es":"22","s d":"23"," lo":"24"," pr":"25","los":"26"," y ":"27","do ":"28","\u00f3n ":"29","i\u00f3n":"30"," un":"31","ci\u00f3":"32","del":"33","o d":"34"," po":"35","a d":"36","aci":"37","sta":"38","te ":"39","ado":"40","pre":"41","to ":"42","par":"43","a e":"44","a l":"45","ra ":"46","al ":"47","e e":"48","se ":"49","pro":"50","ar ":"51","ia ":"52","o e":"53"," re":"54","ida":"55","dad":"56","tra":"57","por":"58","s p":"59"," a ":"60","a p":"61","ara":"62","cia":"63"," pa":"64","com":"65","no ":"66"," di":"67"," in":"68","ien":"69","n l":"70","ad ":"71","ant":"72","e s":"73","men":"74","a c":"75","on ":"76","un ":"77","las":"78","nci":"79"," tr":"80","cio":"81","ier":"82","nto":"83","tiv":"84","n d":"85","n e":"86","or ":"87","s c":"88","enc":"89","ern":"90","io ":"91","a s":"92","ici":"93","s e":"94"," ma":"95","dos":"96","e a":"97","e c":"98","emp":"99","ica":"100","ivo":"101","l p":"102","n c":"103","r e":"104","ta ":"105","ter":"106","e d":"107","esa":"108","ez ":"109","mpr":"110","o a":"111","s a":"112"," ca":"113"," su":"114","ion":"115"," cu":"116"," ju":"117","an ":"118","da ":"119","ene":"120","ero":"121","na ":"122","rec":"123","ro ":"124","tar":"125"," al":"126"," an":"127","bie":"128","e p":"129","er ":"130","l c":"131","n p":"132","omp":"133","ten":"134"," em":"135","ist":"136","nes":"137","nta":"138","o c":"139","so ":"140","tes":"141","era":"142","l d":"143","l m":"144","les":"145","ntr":"146","o s":"147","ore":"148","r\u00e1 ":"149","s q":"150","s y":"151","sto":"152","a a":"153","a r":"154","ari":"155","des":"156","e q":"157","ivi":"158","lic":"159","lo ":"160","n a":"161","one":"162","ora":"163","per":"164","pue":"165","r l":"166","re ":"167","ren":"168","una":"169","\u00eda ":"170","ada":"171","cas":"172","ere":"173","ide":"174","min":"175","n s":"176","ndo":"177","ran":"178","rno":"179"," ac":"180"," ex":"181"," go":"182"," no":"183","a t":"184","aba":"185","ble":"186","ece":"187","ect":"188","l a":"189","l g":"190","lid":"191","nsi":"192","ons":"193","rac":"194","rio":"195","str":"196","uer":"197","ust":"198"," ha":"199"," le":"200"," mi":"201"," mu":"202"," ob":"203"," pe":"204"," pu":"205"," so":"206","a i":"207","ale":"208","ca ":"209","cto":"210","e i":"211","e u":"212","eso":"213","fer":"214","fic":"215","gob":"216","jo ":"217","ma ":"218","mpl":"219","o p":"220","obi":"221","s m":"222","sa ":"223","sep":"224","ste":"225","sti":"226","tad":"227","tod":"228","y s":"229"," ci":"230","and":"231","ces":"232","c\u00f3 ":"233","dor":"234","e m":"235","eci":"236","eco":"237","esi":"238","int":"239","iza":"240","l e":"241","lar":"242","mie":"243","ner":"244","orc":"245","rci":"246","ria":"247","tic":"248","tor":"249"," as":"250"," si":"251","ce ":"252","den":"253","e r":"254","e t":"255","end":"256","eri":"257","esp":"258","ial":"259","ido":"260","ina":"261","inc":"262","mit":"263","o l":"264","ome":"265","pli":"266","ras":"267","s t":"268","sid":"269","sup":"270","tab":"271","uen":"272","ues":"273","ura":"274","vo ":"275","vor":"276"," sa":"277"," ti":"278","abl":"279","ali":"280","aso":"281","ast":"282","cor":"283","cti":"284","cue":"285","div":"286","duc":"287","ens":"288","eti":"289","imi":"290","ini":"291","lec":"292","o q":"293","oce":"294","ort":"295","ral":"296","rma":"297","roc":"298","rod":"299"},"swahili":{" wa":"0","wa ":"1","a k":"2","a m":"3"," ku":"4"," ya":"5","a w":"6","ya ":"7","ni ":"8"," ma":"9","ka ":"10","a u":"11","na ":"12","za ":"13","ia ":"14"," na":"15","ika":"16","ma ":"17","ali":"18","a n":"19"," am":"20","ili":"21","kwa":"22"," kw":"23","ini":"24"," ha":"25","ame":"26","ana":"27","i n":"28"," za":"29","a h":"30","ema":"31","i m":"32","i y":"33","kuw":"34","la ":"35","o w":"36","a y":"37","ata":"38","sem":"39"," la":"40","ati":"41","chi":"42","i w":"43","uwa":"44","aki":"45","li ":"46","eka":"47","ira":"48"," nc":"49","a s":"50","iki":"51","kat":"52","nch":"53"," ka":"54"," ki":"55","a b":"56","aji":"57","amb":"58","ra ":"59","ri ":"60","rik":"61","ada":"62","mat":"63","mba":"64","mes":"65","yo ":"66","zi ":"67","da ":"68","hi ":"69","i k":"70","ja ":"71","kut":"72","tek":"73","wan":"74"," bi":"75","a a":"76","aka":"77","ao ":"78","asi":"79","cha":"80","ese":"81","eza":"82","ke ":"83","moj":"84","oja":"85"," hi":"86","a z":"87","end":"88","ha ":"89","ji ":"90","mu ":"91","shi":"92","wat":"93"," bw":"94","ake":"95","ara":"96","bw ":"97","i h":"98","imb":"99","tik":"100","wak":"101","wal":"102"," hu":"103"," mi":"104"," mk":"105"," ni":"106"," ra":"107"," um":"108","a l":"109","ate":"110","esh":"111","ina":"112","ish":"113","kim":"114","o k":"115"," ir":"116","a i":"117","ala":"118","ani":"119","aq ":"120","azi":"121","hin":"122","i a":"123","idi":"124","ima":"125","ita":"126","rai":"127","raq":"128","sha":"129"," ms":"130"," se":"131","afr":"132","ama":"133","ano":"134","ea ":"135","ele":"136","fri":"137","go ":"138","i i":"139","ifa":"140","iwa":"141","iyo":"142","kus":"143","lia":"144","lio":"145","maj":"146","mku":"147","no ":"148","tan":"149","uli":"150","uta":"151","wen":"152"," al":"153","a j":"154","aad":"155","aid":"156","ari":"157","awa":"158","ba ":"159","fa ":"160","nde":"161","nge":"162","nya":"163","o y":"164","u w":"165","ua ":"166","umo":"167","waz":"168","ye ":"169"," ut":"170"," vi":"171","a d":"172","a t":"173","aif":"174","di ":"175","ere":"176","ing":"177","kin":"178","nda":"179","o n":"180","oa ":"181","tai":"182","toa":"183","usa":"184","uto":"185","was":"186","yak":"187","zo ":"188"," ji":"189"," mw":"190","a p":"191","aia":"192","amu":"193","ang":"194","bik":"195","bo ":"196","del":"197","e w":"198","ene":"199","eng":"200","ich":"201","iri":"202","iti":"203","ito":"204","ki ":"205","kir":"206","ko ":"207","kuu":"208","mar":"209","mbo":"210","mil":"211","ngi":"212","ngo":"213","o l":"214","ong":"215","si ":"216","ta ":"217","tak":"218","u y":"219","umu":"220","usi":"221","uu ":"222","wam":"223"," af":"224"," ba":"225"," li":"226"," si":"227"," zi":"228","a v":"229","ami":"230","atu":"231","awi":"232","eri":"233","fan":"234","fur":"235","ger":"236","i z":"237","isi":"238","izo":"239","lea":"240","mbi":"241","mwa":"242","nye":"243","o h":"244","o m":"245","oni":"246","rez":"247","saa":"248","ser":"249","sin":"250","tat":"251","tis":"252","tu ":"253","uin":"254","uki":"255","ur ":"256","wi ":"257","yar":"258"," da":"259"," en":"260"," mp":"261"," ny":"262"," ta":"263"," ul":"264"," we":"265","a c":"266","a f":"267","ais":"268","apo":"269","ayo":"270","bar":"271","dhi":"272","e a":"273","eke":"274","eny":"275","eon":"276","hai":"277","han":"278","hiy":"279","hur":"280","i s":"281","imw":"282","kal":"283","kwe":"284","lak":"285","lam":"286","mak":"287","msa":"288","ne ":"289","ngu":"290","ru ":"291","sal":"292","swa":"293","te ":"294","ti ":"295","uku":"296","uma":"297","una":"298","uru":"299"},"swedish":{"en ":"0"," de":"1","et ":"2","er ":"3","tt ":"4","om ":"5","f\u00f6r":"6","ar ":"7","de ":"8","att":"9"," f\u00f6":"10","ing":"11"," in":"12"," at":"13"," i ":"14","det":"15","ch ":"16","an ":"17","gen":"18"," an":"19","t s":"20","som":"21","te ":"22"," oc":"23","ter":"24"," ha":"25","lle":"26","och":"27"," sk":"28"," so":"29","ra ":"30","r a":"31"," me":"32","var":"33","nde":"34","\u00e4r ":"35"," ko":"36","on ":"37","ans":"38","int":"39","n s":"40","na ":"41"," en":"42"," fr":"43"," p\u00e5":"44"," st":"45"," va":"46","and":"47","nte":"48","p\u00e5 ":"49","ska":"50","ta ":"51"," vi":"52","der":"53","\u00e4ll":"54","\u00f6rs":"55"," om":"56","da ":"57","kri":"58","ka ":"59","nst":"60"," ho":"61","as ":"62","st\u00e4":"63","r d":"64","t f":"65","upp":"66"," be":"67","nge":"68","r s":"69","tal":"70","t\u00e4l":"71","\u00f6r ":"72"," av":"73","ger":"74","ill":"75","ng ":"76","e s":"77","ekt":"78","ade":"79","era":"80","ers":"81","har":"82","ll ":"83","lld":"84","rin":"85","rna":"86","s\u00e4k":"87","und":"88","inn":"89","lig":"90","ns ":"91"," ma":"92"," pr":"93"," up":"94","age":"95","av ":"96","iva":"97","kti":"98","lda":"99","orn":"100","son":"101","ts ":"102","tta":"103","\u00e4kr":"104"," sj":"105"," ti":"106","avt":"107","ber":"108","els":"109","eta":"110","kol":"111","men":"112","n d":"113","t k":"114","vta":"115","\u00e5r ":"116","juk":"117","man":"118","n f":"119","nin":"120","r i":"121","rs\u00e4":"122","sju":"123","sso":"124"," \u00e4r":"125","a s":"126","ach":"127","ag ":"128","bac":"129","den":"130","ett":"131","fte":"132","hor":"133","nba":"134","oll":"135","rnb":"136","ste":"137","til":"138"," ef":"139"," si":"140","a a":"141","e h":"142","ed ":"143","eft":"144","ga ":"145","ig ":"146","it ":"147","ler":"148","med":"149","n i":"150","nd ":"151","s\u00e5 ":"152","tiv":"153"," bl":"154"," et":"155"," fi":"156"," s\u00e4":"157","at ":"158","des":"159","e a":"160","gar":"161","get":"162","lan":"163","lss":"164","ost":"165","r b":"166","r e":"167","re ":"168","ret":"169","sta":"170","t i":"171"," ge":"172"," he":"173"," re":"174","a f":"175","all":"176","bos":"177","ets":"178","lek":"179","let":"180","ner":"181","nna":"182","nne":"183","r f":"184","rit":"185","s s":"186","sen":"187","sto":"188","tor":"189","vav":"190","ygg":"191"," ka":"192"," s\u00e5":"193"," tr":"194"," ut":"195","ad ":"196","al ":"197","are":"198","e o":"199","gon":"200","kom":"201","n a":"202","n h":"203","nga":"204","r h":"205","ren":"206","t d":"207","tag":"208","tar":"209","tre":"210","\u00e4tt":"211"," f\u00e5":"212"," h\u00e4":"213"," se":"214","a d":"215","a i":"216","a p":"217","ale":"218","ann":"219","ara":"220","byg":"221","gt ":"222","han":"223","igt":"224","kan":"225","la ":"226","n o":"227","nom":"228","nsk":"229","omm":"230","r k":"231","r p":"232","r v":"233","s f":"234","s k":"235","t a":"236","t p":"237","ver":"238"," bo":"239"," br":"240"," ku":"241"," n\u00e5":"242","a b":"243","a e":"244","del":"245","ens":"246","es ":"247","fin":"248","ige":"249","m s":"250","n p":"251","n\u00e5g":"252","or ":"253","r o":"254","rbe":"255","rs ":"256","rt ":"257","s a":"258","s n":"259","skr":"260","t o":"261","ten":"262","tio":"263","ven":"264"," al":"265"," ja":"266"," p ":"267"," r ":"268"," sa":"269","a h":"270","bet":"271","cke":"272","dra":"273","e f":"274","e i":"275","eda":"276","eno":"277","er\u00e4":"278","ess":"279","ion":"280","jag":"281","m f":"282","ne ":"283","nns":"284","pro":"285","r t":"286","rar":"287","riv":"288","r\u00e4t":"289","t e":"290","t t":"291","ust":"292","vad":"293","\u00f6re":"294"," ar":"295"," by":"296"," kr":"297"," mi":"298","arb":"299"},"tagalog":{"ng ":"0","ang":"1"," na":"2"," sa":"3","an ":"4","nan":"5","sa ":"6","na ":"7"," ma":"8"," ca":"9","ay ":"10","n g":"11"," an":"12","ong":"13"," ga":"14","at ":"15"," pa":"16","ala":"17"," si":"18","a n":"19","ga ":"20","g n":"21","g m":"22","ito":"23","g c":"24","man":"25","san":"26","g s":"27","ing":"28","to ":"29","ila":"30","ina":"31"," di":"32"," ta":"33","aga":"34","iya":"35","aca":"36","g t":"37"," at":"38","aya":"39","ama":"40","lan":"41","a a":"42","qui":"43","a c":"44","a s":"45","nag":"46"," ba":"47","g i":"48","tan":"49","'t ":"50"," cu":"51","aua":"52","g p":"53"," ni":"54","os ":"55","'y ":"56","a m":"57"," n ":"58","la ":"59"," la":"60","o n":"61","yan":"62"," ay":"63","usa":"64","cay":"65","on ":"66","ya ":"67"," it":"68","al ":"69","apa":"70","ata":"71","t n":"72","uan":"73","aha":"74","asa":"75","pag":"76"," gu":"77","g l":"78","di ":"79","mag":"80","aba":"81","g a":"82","ara":"83","a p":"84","in ":"85","ana":"86","it ":"87","si ":"88","cus":"89","g b":"90","uin":"91","a t":"92","as ":"93","n n":"94","hin":"95"," hi":"96","a't":"97","ali":"98"," bu":"99","gan":"100","uma":"101","a d":"102","agc":"103","aqu":"104","g d":"105"," tu":"106","aon":"107","ari":"108","cas":"109","i n":"110","niy":"111","pin":"112","a i":"113","gca":"114","siy":"115","a'y":"116","yao":"117","ag ":"118","ca ":"119","han":"120","ili":"121","pan":"122","sin":"123","ual":"124","n s":"125","nam":"126"," lu":"127","can":"128","dit":"129","gui":"130","y n":"131","gal":"132","hat":"133","nal":"134"," is":"135","bag":"136","fra":"137"," fr":"138"," su":"139","a l":"140"," co":"141","ani":"142"," bi":"143"," da":"144","alo":"145","isa":"146","ita":"147","may":"148","o s":"149","sil":"150","una":"151"," in":"152"," pi":"153","l n":"154","nil":"155","o a":"156","pat":"157","sac":"158","t s":"159"," ua":"160","agu":"161","ail":"162","bin":"163","dal":"164","g h":"165","ndi":"166","oon":"167","ua ":"168"," ha":"169","ind":"170","ran":"171","s n":"172","tin":"173","ulo":"174","eng":"175","g f":"176","ini":"177","lah":"178","lo ":"179","rai":"180","rin":"181","ton":"182","g u":"183","inu":"184","lon":"185","o'y":"186","t a":"187"," ar":"188","a b":"189","ad ":"190","bay":"191","cal":"192","gya":"193","ile":"194","mat":"195","n a":"196","pau":"197","ra ":"198","tay":"199","y m":"200","ant":"201","ban":"202","i m":"203","nas":"204","nay":"205","no ":"206","sti":"207"," ti":"208","ags":"209","g g":"210","ta ":"211","uit":"212","uno":"213"," ib":"214"," ya":"215","a u":"216","abi":"217","ati":"218","cap":"219","ig ":"220","is ":"221","la'":"222"," do":"223"," pu":"224","api":"225","ayo":"226","gos":"227","gul":"228","lal":"229","tag":"230","til":"231","tun":"232","y c":"233","y s":"234","yon":"235","ano":"236","bur":"237","iba":"238","isi":"239","lam":"240","nac":"241","nat":"242","ni ":"243","nto":"244","od ":"245","pa ":"246","rgo":"247","urg":"248"," m ":"249","adr":"250","ast":"251","cag":"252","gay":"253","gsi":"254","i p":"255","ino":"256","len":"257","lin":"258","m g":"259","mar":"260","nah":"261","to'":"262"," de":"263","a h":"264","cat":"265","cau":"266","con":"267","iqu":"268","lac":"269","mab":"270","min":"271","og ":"272","par":"273","sal":"274"," za":"275","ao ":"276","doo":"277","ipi":"278","nod":"279","nte":"280","uha":"281","ula":"282"," re":"283","ill":"284","lit":"285","mac":"286","nit":"287","o't":"288","or ":"289","ora":"290","sum":"291","y p":"292"," al":"293"," mi":"294"," um":"295","aco":"296","ada":"297","agd":"298","cab":"299"},"turkish":{"lar":"0","en ":"1","ler":"2","an ":"3","in ":"4"," bi":"5"," ya":"6","eri":"7","de ":"8"," ka":"9","ir ":"10","ar\u0131":"11"," ba":"12"," de":"13"," ha":"14","\u0131n ":"15","ara":"16","bir":"17"," ve":"18"," sa":"19","ile":"20","le ":"21","nde":"22","da ":"23"," bu":"24","ana":"25","ini":"26","\u0131n\u0131":"27","er ":"28","ve ":"29"," y\u0131":"30","lma":"31","y\u0131l":"32"," ol":"33","ar ":"34","n b":"35","nda":"36","aya":"37","li ":"38","as\u0131":"39"," ge":"40","ind":"41","n k":"42","esi":"43","lan":"44","nla":"45","ak ":"46","an\u0131":"47","eni":"48","ni ":"49","n\u0131 ":"50","r\u0131n":"51","san":"52"," ko":"53"," ye":"54","maz":"55","ba\u015f":"56","ili":"57","rin":"58","al\u0131":"59","az ":"60","hal":"61","\u0131nd":"62"," da":"63"," g\u00fc":"64","ele":"65","\u0131lm":"66","\u0131\u011f\u0131":"67","eki":"68","g\u00fcn":"69","i b":"70","i\u00e7i":"71","den":"72","kar":"73","si ":"74"," il":"75","e y":"76","na ":"77","yor":"78","ek ":"79","n s":"80"," i\u00e7":"81","bu ":"82","e b":"83","im ":"84","ki ":"85","len":"86","ri ":"87","s\u0131n":"88"," so":"89","\u00fcn ":"90"," ta":"91","nin":"92","i\u011fi":"93","tan":"94","yan":"95"," si":"96","nat":"97","n\u0131n":"98","kan":"99","r\u0131 ":"100","\u00e7in":"101","\u011f\u0131 ":"102","eli":"103","n a":"104","\u0131r ":"105"," an":"106","ine":"107","n y":"108","ola":"109"," ar":"110","al ":"111","e s":"112","lik":"113","n d":"114","sin":"115"," al":"116"," d\u00fc":"117","anl":"118","ne ":"119","ya ":"120","\u0131m ":"121","\u0131na":"122"," be":"123","ada":"124","ala":"125","ama":"126","ilm":"127","or ":"128","s\u0131 ":"129","yen":"130"," me":"131","at\u0131":"132","di ":"133","eti":"134","ken":"135","la ":"136","l\u0131 ":"137","oru":"138"," g\u00f6":"139"," in":"140","and":"141","e d":"142","men":"143","un ":"144","\u00f6ne":"145","a d":"146","at ":"147","e a":"148","e g":"149","yar":"150"," ku":"151","ay\u0131":"152","dan":"153","edi":"154","iri":"155","\u00fcn\u00fc":"156","\u011fi ":"157","\u0131l\u0131":"158","eme":"159","e\u011fi":"160","i k":"161","i y":"162","\u0131la":"163"," \u00e7a":"164","a y":"165","alk":"166","d\u0131 ":"167","ede":"168","el ":"169","nd\u0131":"170","ra ":"171","\u00fcne":"172"," s\u00fc":"173","d\u0131r":"174","e k":"175","ere":"176","ik ":"177","imi":"178","i\u015fi":"179","mas":"180","n h":"181","s\u00fcr":"182","yle":"183"," ad":"184"," fi":"185"," gi":"186"," se":"187","a k":"188","arl":"189","a\u015f\u0131":"190","iyo":"191","kla":"192","l\u0131\u011f":"193","nem":"194","ney":"195","rme":"196","ste":"197","t\u0131 ":"198","unl":"199","ver":"200"," s\u0131":"201"," te":"202"," to":"203","a s":"204","a\u015fk":"205","ekl":"206","end":"207","kal":"208","li\u011f":"209","min":"210","t\u0131r":"211","ulu":"212","unu":"213","yap":"214","ye ":"215","\u0131 i":"216","\u015fka":"217","\u015ft\u0131":"218"," b\u00fc":"219"," ke":"220"," ki":"221","ard":"222","art":"223","a\u015fa":"224","n i":"225","ndi":"226","ti ":"227","top":"228","\u0131 b":"229"," va":"230"," \u00f6n":"231","aki":"232","cak":"233","ey ":"234","fil":"235","isi":"236","kle":"237","kur":"238","man":"239","nce":"240","nle":"241","nun":"242","rak":"243","\u0131k ":"244"," en":"245"," yo":"246","a g":"247","lis":"248","mak":"249","n g":"250","tir":"251","yas":"252"," i\u015f":"253"," y\u00f6":"254","ale":"255","bil":"256","bul":"257","et ":"258","i d":"259","iye":"260","kil":"261","ma ":"262","n e":"263","n t":"264","nu ":"265","olu":"266","rla":"267","te ":"268","y\u00f6n":"269","\u00e7\u0131k":"270"," ay":"271"," m\u00fc":"272"," \u00e7o":"273"," \u00e7\u0131":"274","a a":"275","a b":"276","ata":"277","der":"278","gel":"279","i g":"280","i i":"281","ill":"282","ist":"283","ld\u0131":"284","lu ":"285","mek":"286","mle":"287","n \u00e7":"288","onu":"289","opl":"290","ran":"291","rat":"292","rd\u0131":"293","rke":"294","siy":"295","son":"296","ta ":"297","t\u00e7\u0131":"298","t\u0131n":"299"},"ukrainian":{" \u043d\u0430":"0"," \u0437\u0430":"1","\u043d\u043d\u044f":"2","\u043d\u044f ":"3","\u043d\u0430 ":"4"," \u043f\u0440":"5","\u043e\u0433\u043e":"6","\u0433\u043e ":"7","\u0441\u044c\u043a":"8"," \u043f\u043e":"9"," \u0443 ":"10","\u0432\u0456\u0434":"11","\u0435\u0440\u0435":"12"," \u043c\u0456":"13"," \u043d\u0435":"14","\u0438\u0445 ":"15","\u0442\u044c ":"16","\u043f\u0435\u0440":"17"," \u0432\u0456":"18","\u0456\u0432 ":"19"," \u043f\u0435":"20"," \u0449\u043e":"21","\u043b\u044c\u043d":"22","\u043c\u0438 ":"23","\u043d\u0456 ":"24","\u043d\u0435 ":"25","\u0442\u0438 ":"26","\u0430\u0442\u0438":"27","\u0435\u043d\u043d":"28","\u043c\u0456\u0441":"29","\u043f\u0440\u0430":"30","\u0443\u0432\u0430":"31","\u043d\u0438\u043a":"32","\u043f\u0440\u043e":"33","\u0440\u0430\u0432":"34","\u0456\u0432\u043d":"35"," \u0442\u0430":"36","\u0431\u0443\u0434":"37","\u0432\u043b\u0456":"38","\u0440\u0456\u0432":"39"," \u043a\u043e":"40"," \u0440\u0456":"41","\u0430\u043b\u044c":"42","\u043d\u043e ":"43","\u043e\u043c\u0443":"44","\u0449\u043e ":"45"," \u0432\u0438":"46","\u043c\u0443 ":"47","\u0440\u0435\u0432":"48","\u0441\u044f ":"49","\u0456\u043d\u043d":"50"," \u0434\u043e":"51"," \u0443\u043f":"52","\u0430\u0432\u043b":"53","\u0430\u043d\u043d":"54","\u043a\u043e\u043c":"55","\u043b\u0438 ":"56","\u043b\u0456\u043d":"57","\u043d\u043e\u0433":"58","\u0443\u043f\u0440":"59"," \u0431\u0443":"60"," \u0437 ":"61"," \u0440\u043e":"62","\u0437\u0430 ":"63","\u0438 \u043d":"64","\u043d\u043e\u0432":"65","\u043e\u0440\u043e":"66","\u043e\u0441\u0442":"67","\u0441\u0442\u0430":"68","\u0442\u0456 ":"69","\u044e\u0442\u044c":"70"," \u043c\u043e":"71"," \u043d\u0456":"72"," \u044f\u043a":"73","\u0431\u043e\u0440":"74","\u0432\u0430 ":"75","\u0432\u0430\u043d":"76","\u0435\u043d\u044c":"77","\u0438 \u043f":"78","\u043d\u044c ":"79","\u043e\u0432\u0456":"80","\u0440\u043e\u043d":"81","\u0441\u0442\u0456":"82","\u0442\u0430 ":"83","\u0443 \u0432":"84","\u044c\u043a\u043e":"85","\u0456\u0441\u0442":"86"," \u0432 ":"87"," \u0440\u0435":"88","\u0434\u043e ":"89","\u0435 \u043f":"90","\u0437\u0430\u0431":"91","\u0438\u0439 ":"92","\u043d\u0441\u044c":"93","\u043e \u0432":"94","\u043e \u043f":"95","\u043f\u0440\u0438":"96","\u0456 \u043f":"97"," \u043a\u0443":"98"," \u043f\u0456":"99"," \u0441\u043f":"100","\u0430 \u043f":"101","\u0430\u0431\u043e":"102","\u0430\u043d\u0441":"103","\u0430\u0446\u0456":"104","\u0432\u0430\u0442":"105","\u0432\u043d\u0438":"106","\u0438 \u0432":"107","\u0438\u043c\u0438":"108","\u043a\u0430 ":"109","\u043d\u0435\u043d":"110","\u043d\u0456\u0447":"111","\u043e\u043d\u0430":"112","\u043e\u0457 ":"113","\u043f\u043e\u0432":"114","\u044c\u043a\u0438":"115","\u044c\u043d\u043e":"116","\u0456\u0437\u043d":"117","\u0456\u0447\u043d":"118"," \u0430\u0432":"119"," \u043c\u0430":"120"," \u043e\u0440":"121"," \u0441\u0443":"122"," \u0447\u0438":"123"," \u0456\u043d":"124","\u0430 \u0437":"125","\u0430\u043c ":"126","\u0430\u0454 ":"127","\u0432\u043d\u0435":"128","\u0432\u0442\u043e":"129","\u0434\u043e\u043c":"130","\u0435\u043d\u0442":"131","\u0436\u0438\u0442":"132","\u0437\u043d\u0438":"133","\u0438\u043c ":"134","\u0438\u0442\u043b":"135","\u043b\u0430 ":"136","\u043d\u0438\u0445":"137","\u043d\u0438\u0446":"138","\u043e\u0432\u0430":"139","\u043e\u0432\u0438":"140","\u043e\u043c ":"141","\u043f\u043e\u0440":"142","\u0442\u044c\u0441":"143","\u0443 \u0440":"144","\u044c\u0441\u044f":"145","\u0456\u0434\u043e":"146","\u0456\u043b\u044c":"147","\u0456\u0441\u044c":"148"," \u0432\u0430":"149"," \u0434\u0456":"150"," \u0436\u0438":"151"," \u0447\u0435":"152"," \u0456 ":"153","\u0430 \u0432":"154","\u0430 \u043d":"155","\u0430\u043b\u0438":"156","\u0432\u0435\u0437":"157","\u0432\u043d\u043e":"158","\u0435\u0432\u0435":"159","\u0435\u0437\u0435":"160","\u0437\u0435\u043d":"161","\u0438\u0446\u0442":"162","\u043a\u0438 ":"163","\u043a\u0438\u0445":"164","\u043a\u043e\u043d":"165","\u043a\u0443 ":"166","\u043b\u0430\u0441":"167","\u043b\u044f ":"168","\u043c\u043e\u0436":"169","\u043d\u0430\u0447":"170","\u043d\u0438\u043c":"171","\u043d\u043e\u0457":"172","\u043e \u0431":"173","\u043e\u0432\u0443":"174","\u043e\u0434\u0438":"175","\u043e\u044e ":"176","\u0440\u043e ":"177","\u0440\u043e\u043a":"178","\u0441\u043d\u043e":"179","\u0441\u043f\u043e":"180","\u0442\u0430\u043a":"181","\u0442\u0432\u0430":"182","\u0442\u0443 ":"183","\u0443 \u043f":"184","\u0446\u0442\u0432":"185","\u044c\u043d\u0438":"186","\u044f \u0437":"187","\u0456 \u043c":"188","\u0456\u0457 ":"189"," \u0432\u0441":"190"," \u0433\u0440":"191"," \u0434\u0435":"192"," \u043d\u043e":"193"," \u043f\u0430":"194"," \u0441\u0435":"195"," \u0443\u043a":"196"," \u0457\u0445":"197","\u0430 \u043e":"198","\u0430\u0432\u0442":"199","\u0430\u0441\u0442":"200","\u0430\u044e\u0442":"201","\u0432\u0430\u0440":"202","\u0434\u0435\u043d":"203","\u0434\u0438 ":"204","\u0434\u0443 ":"205","\u0437\u043d\u0430":"206","\u0438 \u0437":"207","\u0438\u043a\u043e":"208","\u0438\u0441\u044f":"209","\u0438\u0442\u0438":"210","\u043a\u043e\u0433":"211","\u043c\u0435\u043d":"212","\u043d\u043e\u043c":"213","\u043d\u0443 ":"214","\u043e \u043d":"215","\u043e \u0441":"216","\u043e\u0431\u0443":"217","\u043e\u0432\u043e":"218","\u043f\u043b\u0430":"219","\u0440\u0430\u043d":"220","\u0440\u0438\u0432":"221","\u0440\u043e\u0431":"222","\u0441\u043a\u0430":"223","\u0442\u0430\u043d":"224","\u0442\u0438\u043c":"225","\u0442\u0438\u0441":"226","\u0442\u043e ":"227","\u0442\u0440\u0430":"228","\u0443\u0434\u043e":"229","\u0447\u0438\u043d":"230","\u0447\u043d\u0438":"231","\u0456 \u0432":"232","\u0456\u044e ":"233"," \u0430 ":"234"," \u0432\u043e":"235"," \u0434\u0430":"236"," \u043a\u0432":"237"," \u043c\u0435":"238"," \u043e\u0431":"239"," \u0441\u043a":"240"," \u0442\u0438":"241"," \u0444\u0456":"242"," \u0454 ":"243","\u0430 \u0440":"244","\u0430 \u0441":"245","\u0430 \u0443":"246","\u0430\u043a ":"247","\u0430\u043d\u0456":"248","\u0430\u0440\u0442":"249","\u0430\u0441\u043d":"250","\u0432 \u0443":"251","\u0432\u0438\u043a":"252","\u0432\u0456\u0437":"253","\u0434\u043e\u0432":"254","\u0434\u043f\u043e":"255","\u0434\u0456\u0432":"256","\u0435\u0432\u0456":"257","\u0435\u043d\u0441":"258","\u0436\u0435 ":"259","\u0438 \u043c":"260","\u0438 \u0441":"261","\u0438\u043a\u0430":"262","\u0438\u0447\u043d":"263","\u043a\u0456 ":"264","\u043a\u0456\u0432":"265","\u043c\u0456\u0436":"266","\u043d\u0430\u043d":"267","\u043d\u043e\u0441":"268","\u043e \u0443":"269","\u043e\u0431\u043b":"270","\u043e\u0434\u043d":"271","\u043e\u043a ":"272","\u043e\u043b\u043e":"273","\u043e\u0442\u0440":"274","\u0440\u0435\u043d":"275","\u0440\u0438\u043c":"276","\u0440\u043e\u0437":"277","\u0441\u044c ":"278","\u0441\u0456 ":"279","\u0442\u043b\u0430":"280","\u0442\u0456\u0432":"281","\u0443 \u0437":"282","\u0443\u0433\u043e":"283","\u0443\u0434\u0456":"284","\u0447\u0438 ":"285","\u0448\u0435 ":"286","\u044f \u043d":"287","\u044f \u0443":"288","\u0456\u0434\u043f":"289","\u0456\u0439 ":"290","\u0456\u043d\u0430":"291","\u0456\u044f ":"292"," \u043a\u0430":"293"," \u043d\u0438":"294"," \u043e\u0441":"295"," \u0441\u0438":"296"," \u0442\u043e":"297"," \u0442\u0440":"298"," \u0443\u0433":"299"},"urdu":{"\u06cc\u06ba ":"0"," \u06a9\u06cc":"1","\u06a9\u06d2 ":"2"," \u06a9\u06d2":"3","\u0646\u06d2 ":"4"," \u06a9\u06c1":"5","\u06d2 \u06a9":"6","\u06a9\u06cc ":"7","\u0645\u06cc\u06ba":"8"," \u0645\u06cc":"9","\u06c1\u06d2 ":"10","\u0648\u06ba ":"11","\u06a9\u06c1 ":"12"," \u06c1\u06d2":"13","\u0627\u0646 ":"14","\u06c1\u06cc\u06ba":"15","\u0648\u0631 ":"16"," \u06a9\u0648":"17","\u06cc\u0627 ":"18"," \u0627\u0646":"19"," \u0646\u06d2":"20","\u0633\u06d2 ":"21"," \u0633\u06d2":"22"," \u06a9\u0631":"23","\u0633\u062a\u0627":"24"," \u0627\u0648":"25","\u0627\u0648\u0631":"26","\u062a\u0627\u0646":"27","\u0631 \u06a9":"28","\u06cc \u06a9":"29"," \u0627\u0633":"30","\u06d2 \u0627":"31"," \u067e\u0627":"32"," \u06c1\u0648":"33"," \u067e\u0631":"34","\u0631\u0641 ":"35"," \u06a9\u0627":"36","\u0627 \u06a9":"37","\u06cc \u0627":"38"," \u06c1\u06cc":"39","\u062f\u0631 ":"40","\u06a9\u0648 ":"41"," \u0627\u06cc":"42","\u06ba \u06a9":"43"," \u0645\u0634":"44"," \u0645\u0644":"45","\u0627\u062a ":"46","\u0635\u062f\u0631":"47","\u0627\u06a9\u0633":"48","\u0634\u0631\u0641":"49","\u0645\u0634\u0631":"50","\u067e\u0627\u06a9":"51","\u06a9\u0633\u062a":"52","\u06cc \u0645":"53"," \u062f\u06cc":"54"," \u0635\u062f":"55"," \u06cc\u06c1":"56","\u0627 \u06c1":"57","\u0646 \u06a9":"58","\u0648\u0627\u0644":"59","\u06cc\u06c1 ":"60","\u06d2 \u0648":"61"," \u0628\u06be":"62"," \u062f\u0648":"63","\u0627\u0633 ":"64","\u0631 \u0627":"65","\u0646\u06c1\u06cc":"66","\u06a9\u0627 ":"67","\u06d2 \u0633":"68","\u0626\u06cc ":"69","\u06c1 \u0627":"70","\u06cc\u062a ":"71","\u06d2 \u06c1":"72","\u062a \u06a9":"73"," \u0633\u0627":"74","\u0644\u06d2 ":"75","\u06c1\u0627 ":"76","\u06d2 \u0628":"77"," \u0648\u0627":"78","\u0627\u0631 ":"79","\u0646\u06cc ":"80","\u06a9\u06c1\u0627":"81","\u06cc \u06c1":"82","\u06d2 \u0645":"83"," \u0633\u06cc":"84"," \u0644\u06cc":"85","\u0627\u0646\u06c1":"86","\u0627\u0646\u06cc":"87","\u0631 \u0645":"88","\u0631 \u067e":"89","\u0631\u06cc\u062a":"90","\u0646 \u0645":"91","\u06be\u0627 ":"92","\u06cc\u0631 ":"93"," \u062c\u0627":"94"," \u062c\u0646":"95","\u0626\u06d2 ":"96","\u067e\u0631 ":"97","\u06ba \u0646":"98","\u06c1 \u06a9":"99","\u06cc \u0648":"100","\u06d2 \u062f":"101"," \u062a\u0648":"102"," \u062a\u06be":"103"," \u06af\u06cc":"104","\u0627\u06cc\u06a9":"105","\u0644 \u06a9":"106","\u0646\u0627 ":"107","\u06a9\u0631 ":"108","\u06ba \u0645":"109","\u06cc\u06a9 ":"110"," \u0628\u0627":"111","\u0627 \u062a":"112","\u062f\u06cc ":"113","\u0646 \u0633":"114","\u06a9\u06cc\u0627":"115","\u06cc\u0648\u06ba":"116","\u06d2 \u062c":"117","\u0627\u0644 ":"118","\u062a\u0648 ":"119","\u06ba \u0627":"120","\u06d2 \u067e":"121"," \u0686\u0627":"122","\u0627\u0645 ":"123","\u0628\u06be\u06cc":"124","\u062a\u06cc ":"125","\u062a\u06d2 ":"126","\u062f\u0648\u0633":"127","\u0633 \u06a9":"128","\u0645\u0644\u06a9":"129","\u0646 \u0627":"130","\u06c1\u0648\u0631":"131","\u06cc\u06d2 ":"132"," \u0645\u0648":"133"," \u0648\u06a9":"134","\u0627\u0626\u06cc":"135","\u0627\u0631\u062a":"136","\u0627\u0644\u06d2":"137","\u0628\u06be\u0627":"138","\u0631\u062f\u06cc":"139","\u0631\u06cc ":"140","\u0648\u06c1 ":"141","\u0648\u06cc\u0632":"142","\u06ba \u062f":"143","\u06be\u06cc ":"144","\u06cc \u0633":"145"," \u0631\u06c1":"146"," \u0645\u0646":"147"," \u0646\u06c1":"148"," \u0648\u0631":"149"," \u0648\u06c1":"150"," \u06c1\u0646":"151","\u0627 \u0627":"152","\u0627\u0633\u062a":"153","\u062a \u0627":"154","\u062a \u067e":"155","\u062f \u06a9":"156","\u0632 \u0645":"157","\u0646\u062f ":"158","\u0648\u0631\u062f":"159","\u0648\u06a9\u0644":"160","\u06af\u06cc ":"161","\u06af\u06cc\u0627":"162","\u06c1 \u067e":"163","\u06cc\u0632 ":"164","\u06d2 \u062a":"165"," \u0627\u0639":"166"," \u0627\u067e":"167"," \u062c\u0633":"168"," \u062c\u0645":"169"," \u062c\u0648":"170"," \u0633\u0631":"171","\u0627\u067e\u0646":"172","\u0627\u06a9\u062b":"173","\u062a\u06be\u0627":"174","\u062b\u0631\u06cc":"175","\u062f\u06cc\u0627":"176","\u0631 \u062f":"177","\u0631\u062a ":"178","\u0631\u0648\u06cc":"179","\u0633\u06cc ":"180","\u0645\u0644\u0627":"181","\u0646\u062f\u0648":"182","\u0648\u0633\u062a":"183","\u067e\u0631\u0648":"184","\u0686\u0627\u06c1":"185","\u06a9\u062b\u0631":"186","\u06a9\u0644\u0627":"187","\u06c1 \u06c1":"188","\u06c1\u0646\u062f":"189","\u06c1\u0648 ":"190","\u06d2 \u0644":"191"," \u0627\u06a9":"192"," \u062f\u0627":"193"," \u0633\u0646":"194"," \u0648\u0632":"195"," \u067e\u06cc":"196","\u0627 \u0686":"197","\u0627\u0621 ":"198","\u0627\u062a\u06be":"199","\u0627\u0642\u0627":"200","\u0627\u06c1 ":"201","\u062a\u06be ":"202","\u062f\u0648 ":"203","\u0631 \u0628":"204","\u0631\u0648\u0627":"205","\u0631\u06d2 ":"206","\u0633\u0627\u062a":"207","\u0641 \u06a9":"208","\u0642\u0627\u062a":"209","\u0644\u0627 ":"210","\u0644\u0627\u0621":"211","\u0645 \u0645":"212","\u0645 \u06a9":"213","\u0645\u0646 ":"214","\u0646\u0648\u06ba":"215","\u0648 \u0627":"216","\u06a9\u0631\u0646":"217","\u06ba \u06c1":"218","\u06be\u0627\u0631":"219","\u06c1\u0648\u0626":"220","\u06c1\u06cc ":"221","\u06cc\u0634 ":"222"," \u0627\u0645":"223"," \u0644\u0627":"224"," \u0645\u0633":"225"," \u067e\u0648":"226"," \u067e\u06c1":"227","\u0627\u0646\u06d2":"228","\u062a \u0645":"229","\u062a \u06c1":"230","\u062c \u06a9":"231","\u062f\u0648\u0646":"232","\u0632\u06cc\u0631":"233","\u0633 \u0633":"234","\u0634 \u06a9":"235","\u0641 \u0646":"236","\u0644 \u06c1":"237","\u0644\u0627\u0642":"238","\u0644\u06cc ":"239","\u0648\u0631\u06cc":"240","\u0648\u0632\u06cc":"241","\u0648\u0646\u0648":"242","\u06a9\u06be\u0646":"243","\u06af\u0627 ":"244","\u06ba \u0633":"245","\u06ba \u06af":"246","\u06be\u0646\u06d2":"247","\u06be\u06d2 ":"248","\u06c1 \u0628":"249","\u06c1 \u062c":"250","\u06c1\u0631 ":"251","\u06cc \u0622":"252","\u06cc \u067e":"253"," \u062d\u0627":"254"," \u0648\u0641":"255"," \u06af\u0627":"256","\u0627 \u062c":"257","\u0627 \u06af":"258","\u0627\u062f ":"259","\u0627\u062f\u06cc":"260","\u0627\u0639\u0638":"261","\u0627\u06c1\u062a":"262","\u062c\u0633 ":"263","\u062c\u0645\u06c1":"264","\u062c\u0648 ":"265","\u0631 \u0633":"266","\u0631 \u06c1":"267","\u0631\u0646\u06d2":"268","\u0633 \u0645":"269","\u0633\u0627 ":"270","\u0633\u0646\u062f":"271","\u0633\u0646\u06af":"272","\u0638\u0645 ":"273","\u0639\u0638\u0645":"274","\u0644 \u0645":"275","\u0644\u06cc\u06d2":"276","\u0645\u0644 ":"277","\u0645\u0648\u06c1":"278","\u0645\u06c1\u0648":"279","\u0646\u06af\u06be":"280","\u0648 \u0635":"281","\u0648\u0631\u0679":"282","\u0648\u06c1\u0646":"283","\u06a9\u0646 ":"284","\u06af\u06be ":"285","\u06af\u06d2 ":"286","\u06ba \u062c":"287","\u06ba \u0648":"288","\u06ba \u06cc":"289","\u06c1 \u062f":"290","\u06c1\u0646 ":"291","\u06c1\u0648\u06ba":"292","\u06d2 \u062d":"293","\u06d2 \u06af":"294","\u06d2 \u06cc":"295"," \u0627\u06af":"296"," \u0628\u0639":"297"," \u0631\u0648":"298"," \u0634\u0627":"299"},"uzbek":{"\u0430\u043d ":"0","\u0433\u0430\u043d":"1","\u043b\u0430\u0440":"2","\u0433\u0430 ":"3","\u043d\u0433 ":"4","\u0438\u043d\u0433":"5","\u043d\u0438\u043d":"6","\u0434\u0430 ":"7","\u043d\u0438 ":"8","\u0438\u0434\u0430":"9","\u0430\u0440\u0438":"10","\u0438\u0433\u0430":"11","\u0438\u043d\u0438":"12","\u0430\u0440 ":"13","\u0434\u0438 ":"14"," \u0431\u0438":"15","\u0430\u043d\u0438":"16"," \u0431\u043e":"17","\u0434\u0430\u043d":"18","\u043b\u0433\u0430":"19"," \u04b3\u0430":"20"," \u0432\u0430":"21"," \u0441\u0430":"22","\u0433\u0438 ":"23","\u0438\u043b\u0430":"24","\u043d \u0431":"25","\u0438 \u0431":"26"," \u043a\u045e":"27"," \u0442\u0430":"28","\u0438\u0440 ":"29"," \u043c\u0430":"30","\u0430\u0433\u0430":"31","\u0430\u043b\u0430":"32","\u0431\u0438\u0440":"33","\u0440\u0438 ":"34","\u0442\u0433\u0430":"35","\u043b\u0430\u043d":"36","\u043b\u0438\u043a":"37","\u0430 \u043a":"38","\u0430\u0433\u0438":"39","\u0430\u0442\u0438":"40","\u0442\u0430 ":"41","\u0430\u0434\u0438":"42","\u0434\u0430\u0433":"43","\u0440\u0433\u0430":"44"," \u0439\u0438":"45"," \u043c\u0438":"46"," \u043f\u0430":"47"," \u0431\u045e":"48"," \u049b\u0430":"49"," \u049b\u0438":"50","\u0430 \u0431":"51","\u0438\u043b\u043b":"52","\u043b\u0438 ":"53","\u0430\u0441\u0438":"54","\u0438 \u0442":"55","\u0438\u043a ":"56","\u0438\u043b\u0438":"57","\u043b\u043b\u0430":"58","\u0430\u0440\u0434":"59","\u0432\u0447\u0438":"60","\u0432\u0430 ":"61","\u0438\u0431 ":"62","\u0438\u0440\u0438":"63","\u043b\u0438\u0433":"64","\u043d\u0433\u0430":"65","\u0440\u0430\u043d":"66"," \u043a\u0435":"67"," \u045e\u0437":"68","\u0430 \u0441":"69","\u0430\u0445\u0442":"70","\u0431\u045e\u043b":"71","\u0438\u0433\u0438":"72","\u043a\u045e\u0440":"73","\u0440\u0434\u0430":"74","\u0440\u043d\u0438":"75","\u0441\u0430 ":"76"," \u0431\u0435":"77"," \u0431\u0443":"78"," \u0434\u0430":"79"," \u0436\u0430":"80","\u0430 \u0442":"81","\u0430\u0437\u0438":"82","\u0435\u0440\u0438":"83","\u0438 \u0430":"84","\u0438\u043b\u0433":"85","\u0439\u0438\u043b":"86","\u043c\u0430\u043d":"87","\u043f\u0430\u0445":"88","\u0440\u0438\u0434":"89","\u0442\u0438 ":"90","\u0443\u0432\u0447":"91","\u0445\u0442\u0430":"92"," \u043d\u0435":"93"," \u0441\u043e":"94"," \u0443\u0447":"95","\u0430\u0439\u0442":"96","\u043b\u043b\u0438":"97","\u0442\u043b\u0430":"98"," \u0430\u0439":"99"," \u0444\u0440":"100"," \u044d\u0442":"101"," \u04b3\u043e":"102","\u0430 \u049b":"103","\u0430\u043b\u0438":"104","\u0430\u0440\u043e":"105","\u0431\u0435\u0440":"106","\u0431\u0438\u043b":"107","\u0431\u043e\u0440":"108","\u0438\u043c\u0438":"109","\u0438\u0441\u0442":"110","\u043e\u043d ":"111","\u0440\u0438\u043d":"112","\u0442\u0435\u0440":"113","\u0442\u0438\u043b":"114","\u0443\u043d ":"115","\u0444\u0440\u0430":"116","\u049b\u0438\u043b":"117"," \u0431\u0430":"118"," \u043e\u043b":"119","\u0430\u043d\u0441":"120","\u0435\u0444\u0442":"121","\u0437\u0438\u0440":"122","\u043a\u0430\u0442":"123","\u043c\u0438\u043b":"124","\u043d\u0435\u0444":"125","\u0441\u0430\u0433":"126","\u0447\u0438 ":"127","\u045e\u0440\u0430":"128"," \u043d\u0430":"129"," \u0442\u0435":"130"," \u044d\u043d":"131","\u0430 \u044d":"132","\u0430\u043c ":"133","\u0430\u0440\u043d":"134","\u0430\u0442 ":"135","\u0438\u0448 ":"136","\u043c\u0430 ":"137","\u043d\u043b\u0430":"138","\u0440\u043b\u0438":"139","\u0447\u0438\u043b":"140","\u0448\u0433\u0430":"141"," \u0438\u0448":"142"," \u043c\u0443":"143"," \u045e\u049b":"144","\u0430\u0440\u0430":"145","\u0432\u0430\u0437":"146","\u0438 \u0443":"147","\u0438\u049b ":"148","\u043c\u043e\u049b":"149","\u0440\u0438\u043c":"150","\u0443\u0447\u0443":"151","\u0447\u0443\u043d":"152","\u0448\u0438 ":"153","\u044d\u043d\u0433":"154","\u049b\u0443\u0432":"155","\u04b3\u0430\u043c":"156"," \u0441\u045e":"157"," \u0448\u0438":"158","\u0431\u0430\u0440":"159","\u0431\u0435\u043a":"160","\u0434\u0430\u043c":"161","\u0438 \u04b3":"162","\u0438\u0448\u0438":"163","\u043b\u0430\u0434":"164","\u043e\u043b\u0438":"165","\u043e\u043b\u043b":"166","\u043e\u0440\u0438":"167","\u043e\u049b\u0434":"168","\u0440 \u0431":"169","\u0440\u0430 ":"170","\u0440\u043b\u0430":"171","\u0443\u043d\u0438":"172","\u0444\u0442 ":"173","\u045e\u043b\u0433":"174","\u045e\u049b\u0443":"175"," \u0434\u0435":"176"," \u043a\u0430":"177"," \u049b\u045e":"178","\u0430 \u045e":"179","\u0430\u0431\u0430":"180","\u0430\u043c\u043c":"181","\u0430\u0442\u043b":"182","\u0431 \u043a":"183","\u0431\u043e\u0448":"184","\u0437\u0431\u0435":"185","\u0438 \u0432":"186","\u0438\u043c ":"187","\u0438\u043d ":"188","\u0438\u0448\u043b":"189","\u043b\u0430\u0431":"190","\u043b\u0435\u0439":"191","\u043c\u0438\u043d":"192","\u043d \u0434":"193","\u043d\u0434\u0430":"194","\u043e\u049b ":"195","\u0440 \u043c":"196","\u0440\u0438\u043b":"197","\u0441\u0438\u0434":"198","\u0442\u0430\u043b":"199","\u0442\u0430\u043d":"200","\u0442\u0438\u0434":"201","\u0442\u043e\u043d":"202","\u045e\u0437\u0431":"203"," \u0430\u043c":"204"," \u043a\u0438":"205","\u0430 \u04b3":"206","\u0430\u043d\u0433":"207","\u0430\u043d\u0434":"208","\u0430\u0440\u0442":"209","\u0430\u0451\u0442":"210","\u0434\u0438\u0440":"211","\u0435\u043d\u0442":"212","\u0438 \u0434":"213","\u0438 \u043c":"214","\u0438 \u043e":"215","\u0438 \u044d":"216","\u0438\u0440\u043e":"217","\u0439\u0442\u0438":"218","\u043d\u0441\u0443":"219","\u043e\u0434\u0438":"220","\u043e\u0440 ":"221","\u0441\u0438 ":"222","\u0442\u0438\u0448":"223","\u0442\u043e\u0431":"224","\u044d\u0442\u0438":"225","\u049b\u0430\u0440":"226","\u049b\u0434\u0430":"227"," \u0431\u043b":"228"," \u0433\u0435":"229"," \u0434\u043e":"230"," \u0434\u0443":"231"," \u043d\u043e":"232"," \u043f\u0440":"233"," \u0440\u0430":"234"," \u0444\u043e":"235"," \u049b\u043e":"236","\u0430 \u043c":"237","\u0430 \u043e":"238","\u0430\u0439\u0434":"239","\u0430\u043b\u043e":"240","\u0430\u043c\u0430":"241","\u0431\u043b\u0435":"242","\u0433 \u043d":"243","\u0434\u043e\u043b":"244","\u0435\u0439\u0440":"245","\u0435\u043a ":"246","\u0435\u0440\u0433":"247","\u0436\u0430\u0440":"248","\u0437\u0438\u0434":"249","\u0438 \u043a":"250","\u0438 \u0444":"251","\u0438\u0439 ":"252","\u0438\u043b\u043e":"253","\u043b\u0434\u0438":"254","\u043b\u0438\u0431":"255","\u043b\u0438\u043d":"256","\u043c\u0438 ":"257","\u043c\u043c\u0430":"258","\u043d \u0432":"259","\u043d \u043a":"260","\u043d \u045e":"261","\u043d \u04b3":"262","\u043e\u0437\u0438":"263","\u043e\u0440\u0430":"264","\u043e\u0441\u0438":"265","\u0440\u0430\u0441":"266","\u0440\u0438\u0448":"267","\u0440\u043a\u0430":"268","\u0440\u043e\u049b":"269","\u0441\u0442\u043e":"270","\u0442\u0438\u043d":"271","\u0445\u0430\u0442":"272","\u0448\u0438\u0440":"273"," \u0430\u0432":"274"," \u0440\u045e":"275"," \u0442\u0443":"276"," \u045e\u0442":"277","\u0430 \u043f":"278","\u0430\u0432\u0442":"279","\u0430\u0434\u0430":"280","\u0430\u0437\u0430":"281","\u0430\u043d\u043b":"282","\u0431 \u0431":"283","\u0431\u043e\u0439":"284","\u0431\u0443 ":"285","\u0432\u0442\u043e":"286","\u0433 \u044d":"287","\u0433\u0438\u043d":"288","\u0434\u0430\u0440":"289","\u0434\u0435\u043d":"290","\u0434\u0443\u043d":"291","\u0438\u0434\u0435":"292","\u0438\u043e\u043d":"293","\u0438\u0440\u043b":"294","\u0438\u0448\u0433":"295","\u0439\u0445\u0430":"296","\u043a\u0435\u043b":"297","\u043a\u045e\u043f":"298","\u043b\u0438\u043e":"299"},"vietnamese":{"ng ":"0"," th":"1"," ch":"2","g t":"3"," nh":"4","\u00f4ng":"5"," kh":"6"," tr":"7","nh ":"8"," c\u00f4":"9","c\u00f4n":"10"," ty":"11","ty ":"12","i t":"13","n t":"14"," ng":"15","\u1ea1i ":"16"," ti":"17","ch ":"18","y l":"19","\u1ec1n ":"20"," \u0111\u01b0":"21","hi ":"22"," g\u1edf":"23","g\u1edfi":"24","i\u1ec1n":"25","ti\u1ec1":"26","\u1edfi ":"27"," gi":"28"," le":"29"," vi":"30","cho":"31","ho ":"32","kh\u00e1":"33"," v\u00e0":"34","h\u00e1c":"35"," ph":"36","am ":"37","h\u00e0n":"38","\u00e1ch":"39","\u00f4i ":"40","i n":"41","\u01b0\u1ee3c":"42","\u1ee3c ":"43"," t\u00f4":"44","ch\u00fa":"45","i\u1ec7t":"46","t\u00f4i":"47","\u00ean ":"48","\u00fang":"49","\u1ec7t ":"50"," c\u00f3":"51","c t":"52","c\u00f3 ":"53","h\u00fan":"54","vi\u1ec7":"55","\u0111\u01b0\u1ee3":"56"," na":"57","g c":"58","i c":"59","n c":"60","n n":"61","t n":"62","v\u00e0 ":"63","n l":"64","n \u0111":"65","\u00e0ng":"66","\u00e1c ":"67","\u1ea5t ":"68","h l":"69","nam":"70","\u00e2n ":"71","\u0103m ":"72"," h\u00e0":"73"," l\u00e0":"74"," n\u0103":"75"," qu":"76"," t\u1ea1":"77","g m":"78","n\u0103m":"79","t\u1ea1i":"80","\u1edbi ":"81"," l\u1eb9":"82","ay ":"83","e g":"84","h h":"85","i v":"86","i \u0111":"87","le ":"88","l\u1eb9 ":"89","\u1ec1u ":"90","\u1eddi ":"91","h\u00e2n":"92","nhi":"93","t t":"94"," c\u1ee7":"95"," m\u1ed9":"96"," v\u1ec1":"97"," \u0111i":"98","an ":"99","c\u1ee7a":"100","l\u00e0 ":"101","m\u1ed9t":"102","v\u1ec1 ":"103","\u00e0nh":"104","\u1ebft ":"105","\u1ed9t ":"106","\u1ee7a ":"107"," bi":"108"," c\u00e1":"109","a c":"110","anh":"111","c\u00e1c":"112","h c":"113","i\u1ec1u":"114","m t":"115","\u1ec7n ":"116"," ho":"117","'s ":"118","ave":"119","e's":"120","el ":"121","g n":"122","le'":"123","n v":"124","o c":"125","rav":"126","s t":"127","thi":"128","tra":"129","vel":"130","\u1eadn ":"131","\u1ebfn ":"132"," ba":"133"," cu":"134"," sa":"135"," \u0111\u00f3":"136"," \u0111\u1ebf":"137","c c":"138","chu":"139","hi\u1ec1":"140","huy":"141","khi":"142","nh\u00e2":"143","nh\u01b0":"144","ong":"145","ron":"146","thu":"147","th\u01b0":"148","tro":"149","y c":"150","\u00e0y ":"151","\u0111\u1ebfn":"152","\u01b0\u1eddi":"153","\u01b0\u1eddn":"154","\u1ec1 v":"155","\u1eddng":"156"," v\u1edb":"157","cu\u1ed9":"158","g \u0111":"159","i\u1ebft":"160","i\u1ec7n":"161","ng\u00e0":"162","o t":"163","u c":"164","u\u1ed9c":"165","v\u1edbi":"166","\u00e0 c":"167","\u00e0i ":"168","\u01a1ng":"169","\u01b0\u01a1n":"170","\u1ea3i ":"171","\u1ed9c ":"172","\u1ee9c ":"173"," an":"174"," l\u1ead":"175"," ra":"176"," s\u1ebd":"177"," s\u1ed1":"178"," t\u1ed5":"179","a k":"180","bi\u1ebf":"181","c n":"182","c \u0111":"183","ch\u1ee9":"184","g v":"185","gia":"186","g\u00e0y":"187","h\u00e1n":"188","h\u00f4n":"189","h\u01b0 ":"190","h\u1ee9c":"191","i g":"192","i h":"193","i k":"194","i p":"195","i\u00ean":"196","kh\u00f4":"197","l\u1eadp":"198","n k":"199","ra ":"200","r\u00ean":"201","s\u1ebd ":"202","t c":"203","th\u00e0":"204","tr\u00ea":"205","t\u1ed5 ":"206","u n":"207","y t":"208","\u00ecnh":"209","\u1ea5y ":"210","\u1eadp ":"211","\u1ed5 c":"212"," m\u00e1":"213"," \u0111\u1ec3":"214","ai ":"215","c s":"216","g\u01b0\u1edd":"217","h v":"218","hoa":"219","ho\u1ea1":"220","inh":"221","m n":"222","m\u00e1y":"223","n g":"224","ng\u01b0":"225","nh\u1ead":"226","o n":"227","oa ":"228","o\u00e0n":"229","p c":"230","s\u1ed1 ":"231","t \u0111":"232","y v":"233","\u00e0o ":"234","\u00e1y ":"235","\u0103n ":"236","\u0111\u00f3 ":"237","\u0111\u1ec3 ":"238","\u01b0\u1edbc":"239","\u1ea7n ":"240","\u1ec3n ":"241","\u1edbc ":"242"," b\u00e1":"243"," c\u01a1":"244"," c\u1ea3":"245"," c\u1ea7":"246"," h\u1ecd":"247"," k\u1ef3":"248"," li":"249"," m\u1ea1":"250"," s\u1edf":"251"," t\u1eb7":"252"," v\u00e9":"253"," v\u1ee5":"254"," \u0111\u1ea1":"255","a \u0111":"256","bay":"257","c\u01a1 ":"258","g s":"259","han":"260","h\u01b0\u01a1":"261","i s":"262","k\u1ef3 ":"263","m c":"264","n m":"265","n p":"266","o b":"267","o\u1ea1i":"268","qua":"269","s\u1edf ":"270","tha":"271","th\u00e1":"272","t\u1eb7n":"273","v\u00e0o":"274","v\u00e9 ":"275","v\u1ee5 ":"276","y b":"277","\u00e0n ":"278","\u00e1ng":"279","\u01a1 s":"280","\u1ea7u ":"281","\u1eadt ":"282","\u1eb7ng":"283","\u1ecdc ":"284","\u1edf t":"285","\u1eefng":"286"," du":"287"," lu":"288"," ta":"289"," to":"290"," t\u1eeb":"291"," \u1edf ":"292","a v":"293","ao ":"294","c v":"295","c\u1ea3 ":"296","du ":"297","g l":"298","gi\u1ea3":"299"},"welsh":{"yn ":"0","dd ":"1"," yn":"2"," y ":"3","ydd":"4","eth":"5","th ":"6"," i ":"7","aet":"8","d y":"9","ch ":"10","od ":"11","ol ":"12","edd":"13"," ga":"14"," gw":"15","'r ":"16","au ":"17","ddi":"18","ad ":"19"," cy":"20"," gy":"21"," ei":"22"," o ":"23","iad":"24","yr ":"25","an ":"26","bod":"27","wed":"28"," bo":"29"," dd":"30","el ":"31","n y":"32"," am":"33","di ":"34","edi":"35","on ":"36"," we":"37"," ym":"38"," ar":"39"," rh":"40","odd":"41"," ca":"42"," ma":"43","ael":"44","oed":"45","dae":"46","n a":"47","dda":"48","er ":"49","h y":"50","all":"51","ei ":"52"," ll":"53","am ":"54","eu ":"55","fod":"56","fyd":"57","l y":"58","n g":"59","wyn":"60","d a":"61","i g":"62","mae":"63","neu":"64","os ":"65"," ne":"66","d i":"67","dod":"68","dol":"69","n c":"70","r h":"71","wyd":"72","wyr":"73","ai ":"74","ar ":"75","in ":"76","rth":"77"," fy":"78"," he":"79"," me":"80"," yr":"81","'n ":"82","dia":"83","est":"84","h c":"85","hai":"86","i d":"87","id ":"88","r y":"89","y b":"90"," dy":"91"," ha":"92","ada":"93","i b":"94","n i":"95","ote":"96","rot":"97","tes":"98","y g":"99","yd ":"100"," ad":"101"," mr":"102"," un":"103","cyn":"104","dau":"105","ddy":"106","edo":"107","i c":"108","i w":"109","ith":"110","lae":"111","lla":"112","nd ":"113","oda":"114","ryd":"115","tho":"116"," a ":"117"," dr":"118","aid":"119","ain":"120","ddo":"121","dyd":"122","fyn":"123","gyn":"124","hol":"125","io ":"126","o a":"127","wch":"128","wyb":"129","ybo":"130","ych":"131"," br":"132"," by":"133"," di":"134"," fe":"135"," na":"136"," o'":"137"," pe":"138","art":"139","byd":"140","dro":"141","gal":"142","l e":"143","lai":"144","mr ":"145","n n":"146","r a":"147","rhy":"148","wn ":"149","ynn":"150"," on":"151"," r ":"152","cae":"153","d g":"154","d o":"155","d w":"156","gan":"157","gwy":"158","n d":"159","n f":"160","n o":"161","ned":"162","ni ":"163","o'r":"164","r d":"165","ud ":"166","wei":"167","wrt":"168"," an":"169"," cw":"170"," da":"171"," ni":"172"," pa":"173"," pr":"174"," wy":"175","d e":"176","dai":"177","dim":"178","eud":"179","gwa":"180","idd":"181","im ":"182","iri":"183","lwy":"184","n b":"185","nol":"186","r o":"187","rwy":"188"," ch":"189"," er":"190"," fo":"191"," ge":"192"," hy":"193"," i'":"194"," ro":"195"," sa":"196"," tr":"197","bob":"198","cwy":"199","cyf":"200","dio":"201","dyn":"202","eit":"203","hel":"204","hyn":"205","ich":"206","ll ":"207","mdd":"208","n r":"209","ond":"210","pro":"211","r c":"212","r g":"213","red":"214","rha":"215","u a":"216","u c":"217","u y":"218","y c":"219","ymd":"220","ymr":"221","yw ":"222"," ac":"223"," be":"224"," bl":"225"," co":"226"," os":"227","adw":"228","ae ":"229","af ":"230","d p":"231","efn":"232","eic":"233","en ":"234","eol":"235","es ":"236","fer":"237","gel":"238","h g":"239","hod":"240","ied":"241","ir ":"242","laf":"243","n h":"244","na ":"245","nyd":"246","odo":"247","ofy":"248","rdd":"249","rie":"250","ros":"251","stw":"252","twy":"253","yda":"254","yng":"255"," at":"256"," de":"257"," go":"258"," id":"259"," oe":"260"," \u00e2 ":"261","'ch":"262","ac ":"263","ach":"264","ae'":"265","al ":"266","bl ":"267","d c":"268","d l":"269","dan":"270","dde":"271","ddw":"272","dir":"273","dla":"274","ed ":"275","ela":"276","ell":"277","ene":"278","ewn":"279","gyd":"280","hau":"281","hyw":"282","i a":"283","i f":"284","iol":"285","ion":"286","l a":"287","l i":"288","lia":"289","med":"290","mon":"291","n s":"292","no ":"293","obl":"294","ola":"295","ref":"296","rn ":"297","thi":"298","un ":"299"}},"trigram-unicodemap":{"Basic Latin":{"albanian":661,"azeri":653,"bengali":1,"cebuano":750,"croatian":733,"czech":652,"danish":734,"dutch":741,"english":723,"estonian":739,"finnish":743,"french":733,"german":750,"hausa":752,"hawaiian":751,"hungarian":693,"icelandic":662,"indonesian":776,"italian":741,"latin":764,"latvian":693,"lithuanian":738,"mongolian":19,"norwegian":742,"pidgin":702,"polish":701,"portuguese":726,"romanian":714,"slovak":677,"slovene":740,"somali":755,"spanish":749,"swahili":770,"swedish":717,"tagalog":767,"turkish":673,"vietnamese":503,"welsh":728},"Latin-1 Supplement":{"albanian":68,"azeri":10,"czech":51,"danish":13,"estonian":19,"finnish":39,"french":21,"german":8,"hungarian":72,"icelandic":80,"italian":3,"norwegian":5,"polish":6,"portuguese":18,"romanian":9,"slovak":37,"spanish":6,"swedish":26,"turkish":25,"vietnamese":56,"welsh":1},"[Malformatted]":{"albanian":68,"arabic":724,"azeri":109,"bengali":1472,"bulgarian":750,"croatian":10,"czech":78,"danish":13,"estonian":19,"farsi":706,"finnish":39,"french":21,"german":8,"hausa":8,"hindi":1386,"hungarian":74,"icelandic":80,"italian":3,"kazakh":767,"kyrgyz":767,"latvian":56,"lithuanian":30,"macedonian":755,"mongolian":743,"nepali":1514,"norwegian":5,"pashto":677,"polish":45,"portuguese":18,"romanian":31,"russian":759,"serbian":757,"slovak":45,"slovene":10,"spanish":6,"swedish":26,"turkish":87,"ukrainian":748,"urdu":682,"uzbek":773,"vietnamese":289,"welsh":1},"Arabic":{"arabic":724,"farsi":706,"pashto":677,"urdu":682},"Latin Extended-B":{"azeri":73,"hausa":8,"vietnamese":19},"Latin Extended-A":{"azeri":25,"croatian":10,"czech":27,"hungarian":2,"latvian":56,"lithuanian":30,"polish":39,"romanian":22,"slovak":8,"slovene":10,"turkish":62,"vietnamese":20},"Combining Diacritical Marks":{"azeri":1},"Bengali":{"bengali":714},"Gujarati":{"bengali":16},"Gurmukhi":{"bengali":6},"Cyrillic":{"bulgarian":750,"kazakh":767,"kyrgyz":767,"macedonian":755,"mongolian":743,"russian":759,"serbian":757,"ukrainian":748,"uzbek":773},"Devanagari":{"hindi":693,"nepali":757},"Latin Extended Additional":{"vietnamese":97}}}
},{}],36:[function(require,module,exports){
module.exports=[["0x0000","0x007F","Basic Latin"],["0x0080","0x00FF","Latin-1 Supplement"],["0x0100","0x017F","Latin Extended-A"],["0x0180","0x024F","Latin Extended-B"],["0x0250","0x02AF","IPA Extensions"],["0x02B0","0x02FF","Spacing Modifier Letters"],["0x0300","0x036F","Combining Diacritical Marks"],["0x0370","0x03FF","Greek and Coptic"],["0x0400","0x04FF","Cyrillic"],["0x0500","0x052F","Cyrillic Supplement"],["0x0530","0x058F","Armenian"],["0x0590","0x05FF","Hebrew"],["0x0600","0x06FF","Arabic"],["0x0700","0x074F","Syriac"],["0x0750","0x077F","Arabic Supplement"],["0x0780","0x07BF","Thaana"],["0x0900","0x097F","Devanagari"],["0x0980","0x09FF","Bengali"],["0x0A00","0x0A7F","Gurmukhi"],["0x0A80","0x0AFF","Gujarati"],["0x0B00","0x0B7F","Oriya"],["0x0B80","0x0BFF","Tamil"],["0x0C00","0x0C7F","Telugu"],["0x0C80","0x0CFF","Kannada"],["0x0D00","0x0D7F","Malayalam"],["0x0D80","0x0DFF","Sinhala"],["0x0E00","0x0E7F","Thai"],["0x0E80","0x0EFF","Lao"],["0x0F00","0x0FFF","Tibetan"],["0x1000","0x109F","Myanmar"],["0x10A0","0x10FF","Georgian"],["0x1100","0x11FF","Hangul Jamo"],["0x1200","0x137F","Ethiopic"],["0x1380","0x139F","Ethiopic Supplement"],["0x13A0","0x13FF","Cherokee"],["0x1400","0x167F","Unified Canadian Aboriginal Syllabics"],["0x1680","0x169F","Ogham"],["0x16A0","0x16FF","Runic"],["0x1700","0x171F","Tagalog"],["0x1720","0x173F","Hanunoo"],["0x1740","0x175F","Buhid"],["0x1760","0x177F","Tagbanwa"],["0x1780","0x17FF","Khmer"],["0x1800","0x18AF","Mongolian"],["0x1900","0x194F","Limbu"],["0x1950","0x197F","Tai Le"],["0x1980","0x19DF","New Tai Lue"],["0x19E0","0x19FF","Khmer Symbols"],["0x1A00","0x1A1F","Buginese"],["0x1D00","0x1D7F","Phonetic Extensions"],["0x1D80","0x1DBF","Phonetic Extensions Supplement"],["0x1DC0","0x1DFF","Combining Diacritical Marks Supplement"],["0x1E00","0x1EFF","Latin Extended Additional"],["0x1F00","0x1FFF","Greek Extended"],["0x2000","0x206F","General Punctuation"],["0x2070","0x209F","Superscripts and Subscripts"],["0x20A0","0x20CF","Currency Symbols"],["0x20D0","0x20FF","Combining Diacritical Marks for Symbols"],["0x2100","0x214F","Letterlike Symbols"],["0x2150","0x218F","Number Forms"],["0x2190","0x21FF","Arrows"],["0x2200","0x22FF","Mathematical Operators"],["0x2300","0x23FF","Miscellaneous Technical"],["0x2400","0x243F","Control Pictures"],["0x2440","0x245F","Optical Character Recognition"],["0x2460","0x24FF","Enclosed Alphanumerics"],["0x2500","0x257F","Box Drawing"],["0x2580","0x259F","Block Elements"],["0x25A0","0x25FF","Geometric Shapes"],["0x2600","0x26FF","Miscellaneous Symbols"],["0x2700","0x27BF","Dingbats"],["0x27C0","0x27EF","Miscellaneous Mathematical Symbols-A"],["0x27F0","0x27FF","Supplemental Arrows-A"],["0x2800","0x28FF","Braille Patterns"],["0x2900","0x297F","Supplemental Arrows-B"],["0x2980","0x29FF","Miscellaneous Mathematical Symbols-B"],["0x2A00","0x2AFF","Supplemental Mathematical Operators"],["0x2B00","0x2BFF","Miscellaneous Symbols and Arrows"],["0x2C00","0x2C5F","Glagolitic"],["0x2C80","0x2CFF","Coptic"],["0x2D00","0x2D2F","Georgian Supplement"],["0x2D30","0x2D7F","Tifinagh"],["0x2D80","0x2DDF","Ethiopic Extended"],["0x2E00","0x2E7F","Supplemental Punctuation"],["0x2E80","0x2EFF","CJK Radicals Supplement"],["0x2F00","0x2FDF","Kangxi Radicals"],["0x2FF0","0x2FFF","Ideographic Description Characters"],["0x3000","0x303F","CJK Symbols and Punctuation"],["0x3040","0x309F","Hiragana"],["0x30A0","0x30FF","Katakana"],["0x3100","0x312F","Bopomofo"],["0x3130","0x318F","Hangul Compatibility Jamo"],["0x3190","0x319F","Kanbun"],["0x31A0","0x31BF","Bopomofo Extended"],["0x31C0","0x31EF","CJK Strokes"],["0x31F0","0x31FF","Katakana Phonetic Extensions"],["0x3200","0x32FF","Enclosed CJK Letters and Months"],["0x3300","0x33FF","CJK Compatibility"],["0x3400","0x4DBF","CJK Unified Ideographs Extension A"],["0x4DC0","0x4DFF","Yijing Hexagram Symbols"],["0x4E00","0x9FFF","CJK Unified Ideographs"],["0xA000","0xA48F","Yi Syllables"],["0xA490","0xA4CF","Yi Radicals"],["0xA700","0xA71F","Modifier Tone Letters"],["0xA800","0xA82F","Syloti Nagri"],["0xAC00","0xD7AF","Hangul Syllables"],["0xD800","0xDB7F","High Surrogates"],["0xDB80","0xDBFF","High Private Use Surrogates"],["0xDC00","0xDFFF","Low Surrogates"],["0xE000","0xF8FF","Private Use Area"],["0xF900","0xFAFF","CJK Compatibility Ideographs"],["0xFB00","0xFB4F","Alphabetic Presentation Forms"],["0xFB50","0xFDFF","Arabic Presentation Forms-A"],["0xFE00","0xFE0F","Variation Selectors"],["0xFE10","0xFE1F","Vertical Forms"],["0xFE20","0xFE2F","Combining Half Marks"],["0xFE30","0xFE4F","CJK Compatibility Forms"],["0xFE50","0xFE6F","Small Form Variants"],["0xFE70","0xFEFF","Arabic Presentation Forms-B"],["0xFF00","0xFFEF","Halfwidth and Fullwidth Forms"],["0xFFF0","0xFFFF","Specials"],["0x10000","0x1007F","Linear B Syllabary"],["0x10080","0x100FF","Linear B Ideograms"],["0x10100","0x1013F","Aegean Numbers"],["0x10140","0x1018F","Ancient Greek Numbers"],["0x10300","0x1032F","Old Italic"],["0x10330","0x1034F","Gothic"],["0x10380","0x1039F","Ugaritic"],["0x103A0","0x103DF","Old Persian"],["0x10400","0x1044F","Deseret"],["0x10450","0x1047F","Shavian"],["0x10480","0x104AF","Osmanya"],["0x10800","0x1083F","Cypriot Syllabary"],["0x10A00","0x10A5F","Kharoshthi"],["0x1D000","0x1D0FF","Byzantine Musical Symbols"],["0x1D100","0x1D1FF","Musical Symbols"],["0x1D200","0x1D24F","Ancient Greek Musical Notation"],["0x1D300","0x1D35F","Tai Xuan Jing Symbols"],["0x1D400","0x1D7FF","Mathematical Alphanumeric Symbols"],["0x20000","0x2A6DF","CJK Unified Ideographs Extension B"],["0x2F800","0x2FA1F","CJK Compatibility Ideographs Supplement"],["0xE0000","0xE007F","Tags"],["0xE0100","0xE01EF","Variation Selectors Supplement"],["0xF0000","0xFFFFF","Supplementary Private Use Area-A"],["0x100000","0x10FFFF","Supplementary Private Use Area-B"]]
},{}],37:[function(require,module,exports){
module.exports = require('./lib/LanguageDetect');
},{"./lib/LanguageDetect":39}],38:[function(require,module,exports){
var Languages = module.exports = {
  getCode2:function (lang) {
    return Languages.nameToCode2[String(lang).toLowerCase()] || null;
  },

  getCode3: function(lang) {
    return Languages.nameToCode3[String(lang).toLowerCase()] || null;
  },

  getName2: function(code) {
    return Languages.code2ToName[String(code).toLowerCase()] || null;
  },

  getName3: function(code) {
    return Languages.code3ToName[String(code).toLowerCase()] || null;
  },

  nameToCode2:{
    'albanian':'sq',
    'arabic':'ar',
    'azeri':'az',
    'bengali':'bn',
    'bulgarian':'bg',
    'cebuano':null,
    'croatian':'hr',
    'czech':'cs',
    'danish':'da',
    'dutch':'nl',
    'english':'en',
    'estonian':'et',
    'farsi':'fa',
    'finnish':'fi',
    'french':'fr',
    'german':'de',
    'hausa':'ha',
    'hawaiian':null,
    'hindi':'hi',
    'hungarian':'hu',
    'icelandic':'is',
    'indonesian':'id',
    'italian':'it',
    'kazakh':'kk',
    'kyrgyz':'ky',
    'latin':'la',
    'latvian':'lv',
    'lithuanian':'lt',
    'macedonian':'mk',
    'mongolian':'mn',
    'nepali':'ne',
    'norwegian':'no',
    'pashto':'ps',
    'pidgin':null,
    'polish':'pl',
    'portuguese':'pt',
    'romanian':'ro',
    'russian':'ru',
    'serbian':'sr',
    'slovak':'sk',
    'slovene':'sl',
    'somali':'so',
    'spanish':'es',
    'swahili':'sw',
    'swedish':'sv',
    'tagalog':'tl',
    'turkish':'tr',
    'ukrainian':'uk',
    'urdu':'ur',
    'uzbek':'uz',
    'vietnamese':'vi',
    'welsh':'cy'
  },

  nameToCode3:{
    'albanian':'sqi',
    'arabic':'ara',
    'azeri':'aze',
    'bengali':'ben',
    'bulgarian':'bul',
    'cebuano':'ceb',
    'croatian':'hrv',
    'czech':'ces',
    'danish':'dan',
    'dutch':'nld',
    'english':'eng',
    'estonian':'est',
    'farsi':'fas',
    'finnish':'fin',
    'french':'fra',
    'german':'deu',
    'hausa':'hau',
    'hawaiian':'haw',
    'hindi':'hin',
    'hungarian':'hun',
    'icelandic':'isl',
    'indonesian':'ind',
    'italian':'ita',
    'kazakh':'kaz',
    'kyrgyz':'kir',
    'latin':'lat',
    'latvian':'lav',
    'lithuanian':'lit',
    'macedonian':'mkd',
    'mongolian':'mon',
    'nepali':'nep',
    'norwegian':'nor',
    'pashto':'pus',
    'pidgin':'crp',
    'polish':'pol',
    'portuguese':'por',
    'romanian':'ron',
    'russian':'rus',
    'serbian':'srp',
    'slovak':'slk',
    'slovene':'slv',
    'somali':'som',
    'spanish':'spa',
    'swahili':'swa',
    'swedish':'swe',
    'tagalog':'tgl',
    'turkish':'tur',
    'ukrainian':'ukr',
    'urdu':'urd',
    'uzbek':'uzb',
    'vietnamese':'vie',
    'welsh':'cym'
  },
  code2ToName:{
    'ar':'arabic',
    'az':'azeri',
    'bg':'bulgarian',
    'bn':'bengali',
    'cs':'czech',
    'cy':'welsh',
    'da':'danish',
    'de':'german',
    'en':'english',
    'es':'spanish',
    'et':'estonian',
    'fa':'farsi',
    'fi':'finnish',
    'fr':'french',
    'ha':'hausa',
    'hi':'hindi',
    'hr':'croatian',
    'hu':'hungarian',
    'id':'indonesian',
    'is':'icelandic',
    'it':'italian',
    'kk':'kazakh',
    'ky':'kyrgyz',
    'la':'latin',
    'lt':'lithuanian',
    'lv':'latvian',
    'mk':'macedonian',
    'mn':'mongolian',
    'ne':'nepali',
    'nl':'dutch',
    'no':'norwegian',
    'pl':'polish',
    'ps':'pashto',
    'pt':'portuguese',
    'ro':'romanian',
    'ru':'russian',
    'sk':'slovak',
    'sl':'slovene',
    'so':'somali',
    'sq':'albanian',
    'sr':'serbian',
    'sv':'swedish',
    'sw':'swahili',
    'tl':'tagalog',
    'tr':'turkish',
    'uk':'ukrainian',
    'ur':'urdu',
    'uz':'uzbek',
    'vi':'vietnamese'
  },

  code3ToName:{
    'ara':'arabic',
    'aze':'azeri',
    'ben':'bengali',
    'bul':'bulgarian',
    'ceb':'cebuano',
    'ces':'czech',
    'crp':'pidgin',
    'cym':'welsh',
    'dan':'danish',
    'deu':'german',
    'eng':'english',
    'est':'estonian',
    'fas':'farsi',
    'fin':'finnish',
    'fra':'french',
    'hau':'hausa',
    'haw':'hawaiian',
    'hin':'hindi',
    'hrv':'croatian',
    'hun':'hungarian',
    'ind':'indonesian',
    'isl':'icelandic',
    'ita':'italian',
    'kaz':'kazakh',
    'kir':'kyrgyz',
    'lat':'latin',
    'lav':'latvian',
    'lit':'lithuanian',
    'mkd':'macedonian',
    'mon':'mongolian',
    'nep':'nepali',
    'nld':'dutch',
    'nor':'norwegian',
    'pol':'polish',
    'por':'portuguese',
    'pus':'pashto',
    'rom':'romanian',
    'rus':'russian',
    'slk':'slovak',
    'slv':'slovene',
    'som':'somali',
    'spa':'spanish',
    'sqi':'albanian',
    'srp':'serbian',
    'swa':'swahili',
    'swe':'swedish',
    'tgl':'tagalog',
    'tur':'turkish',
    'ukr':'ukrainian',
    'urd':'urdu',
    'uzb':'uzbek',
    'vie':'vietnamese'
  }
};
},{}],39:[function(require,module,exports){
/**
 *
 * Detects the language of a given piece of text.
 *
 * Attempts to detect the language of a sample of text by correlating ranked
 * 3-gram frequencies to a table of 3-gram frequencies of known languages.
 *
 * Implements a version of a technique originally proposed by Cavnar & Trenkle
 * (1994): "N-Gram-Based Text Categorization"
 *
 * Largely inspired from the PHP Pear Package Text_LanguageDetect by Nicholas Pisarro
 * Licence: http://www.debian.org/misc/bsd.license BSD
 *
 * @author Francois-Guillaume Ribreau - @FGRibreau
 * @author Ruslan Zavackiy - @Chaoser
 *
 * @see https://github.com/FGRibreau/node-language-detect
 *
 * Installation:
 *  npm install LanguageDetect
 *
 * @example
 * <code>
 * var LanguageDetect = require("../LanguageDetect");
 * var d = new LanguageDetect().detect('This is a test');
 * // d[0] == 'english'
 * // d[1] == 0.5969230769230769
 * // Good score are over 0.3
 * </code>
 */

var dbLang = require('../data/lang.json')
  , Parser = require('./Parser')
  , ISO639 = require('./ISO639');

var LanguageDetect = module.exports = function (languageType) {

  /**
   * The trigram data for comparison
   *
   * Will be loaded on start from $this->_db_filename
   *
   * May be set to a PEAR_Error object if there is an error during its
   * initialization
   *
   * @var      array
   * @access   private
   */
  this.langDb = {};

  /**
   * The size of the trigram data arrays
   *
   * @var     int
   * @access  private
   */
  this.threshold = 300;

  this.useUnicodeNarrowing = true;

  /**
   * Constructor
   *
   * Load the language database.
   *
   */
  this.langDb = dbLang['trigram'];
  this.unicodeMap = dbLang['trigram-unicodemap'];

  this.languageType = languageType || null;
};

LanguageDetect.prototype = {

  /**
   * Returns the number of languages that this object can detect
   *
   * @access public
   * @return int the number of languages
   */
  getLanguageCount:function () {
    return this.getLanguages().length;
  },

  setLanguageType:function (type) {
    return this.languageType = type;
  },

  /**
   * Returns the list of detectable languages
   *
   * @access public
   * @return object the names of the languages known to this object
   */
  getLanguages:function () {
    return Object.keys(this.langDb);
  },

  /**
   * Calculates a linear rank-order distance statistic between two sets of
   * ranked trigrams
   *
   * Sums the differences in rank for each trigram. If the trigram does not
   * appear in both, consider it a difference of $this->_threshold.
   *
   * This distance measure was proposed by Cavnar & Trenkle (1994). Despite
   * its simplicity it has been shown to be highly accurate for language
   * identification tasks.
   *
   * @access  private
   * @param   arr1  the reference set of trigram ranks
   * @param   arr2  the target set of trigram ranks
   * @return  int   the sum of the differences between the ranks of
   *                the two trigram sets
   */
  distance:function (arr1, arr2) {
    var me = this
      , sumdist = 0
      , keys = Object.keys(arr2)
      , i;

    for (i = keys.length; i--;) {
      sumdist += arr1[keys[i]] ? Math.abs(arr2[keys[i]] - arr1[keys[i]]) : me.threshold;
    }

    return sumdist;
  },

  /**
   * Normalizes the score returned by _distance()
   *
   * Different if perl compatible or not
   *
   * @access  private
   * @param   score       the score from _distance()
   * @param   baseCount   the number of trigrams being considered
   * @return  number      the normalized score
   *
   * @see     distance()
   */
  normalizeScore:function (score, baseCount) {
    return 1 - (score / (baseCount || this.threshold) / this.threshold);
  },

  /**
   * Detects the closeness of a sample of text to the known languages
   *
   * Calculates the statistical difference between the text and
   * the trigrams for each language, normalizes the score then
   * returns results for all languages in sorted order
   *
   * If perl compatible, the score is 300-0, 0 being most similar.
   * Otherwise, it's 0-1 with 1 being most similar.
   *
   * The $sample text should be at least a few sentences in length;
   * should be ascii-7 or utf8 encoded, if another and the mbstring extension
   * is present it will try to detect and convert. However, experience has
   * shown that mb_detect_encoding() *does not work very well* with at least
   * some types of encoding.
   *
   * @access  public
   * @param   sample  a sample of text to compare.
   * @param   limit  if specified, return an array of the most likely
   *                  $limit languages and their scores.
   * @return  Array   sorted array of language scores, blank array if no
   *                  useable text was found, or PEAR_Error if error
   *                  with the object setup
   *
   * @see     distance()
   */
  detect:function (sample, limit) {
    var me = this
      , scores = [];

    limit = +limit || 0;

    if (sample == '' || String(sample).length < 3) return [];

    var sampleObj = new Parser(sample);
    sampleObj.setPadStart(true);
    sampleObj.analyze();

    var trigramFreqs = sampleObj.getTrigramRanks()
      , trigramCount = Object.keys(trigramFreqs).length;

    if (trigramCount == 0) return [];

    var keys = [], i, lang;

    if (this.useUnicodeNarrowing) {
      var blocks = sampleObj.getUnicodeBlocks()
        , languages = Object.keys(blocks)
        , keysLength = languages.length;

      for (i = keysLength; i--;) {
        if (this.unicodeMap[languages[i]]) {
          for (lang in this.unicodeMap[languages[i]]) {
            if (!~keys.indexOf(lang)) keys.push(lang);
          }
        }
      }
    } else {
      keys = me.getLanguages();
    }

    for (i = keys.length; i--;) {
      var score = me.normalizeScore(me.distance(me.langDb[keys[i]], trigramFreqs), trigramCount);
      if (score) scores.push([keys[i], score]);
    }

    // Sort the array
    scores.sort(function (a, b) { return b[1] - a[1]; });
    var scoresLength = scores.length;

    if (!scoresLength) return [];

    switch (me.languageType) {
      case 'iso2':
        for (i = scoresLength; i--;) {
          scores[i][0] = ISO639.getCode2(scores[i][0]);
        }
        break;
      case 'iso3':
        for (i = scoresLength; i--;) {
          scores[i][0] = ISO639.getCode3(scores[i][0]);
        }
        break;
    }

    // limit the number of returned scores
    return limit > 0 ? scores.slice(0, limit) : scores;
  }
};

},{"../data/lang.json":35,"./ISO639":38,"./Parser":40}],40:[function(require,module,exports){
var dbUnicodeBlocks = require('../data/unicode_blocks.json');

/**
 * This class represents a text sample to be parsed.
 *
 * Largely inspired from the PHP Pear Package Text_LanguageDetect by Nicholas Pisarro
 * Licence: http://www.debian.org/misc/bsd.license BSD
 *
 * @author Francois-Guillaume Ribreau - @FGRibreau
 * @author Ruslan Zavackiy - @Chaoser
 *
 * @see https://github.com/FGRibreau/node-language-detect
 */
var Parser = module.exports = function (string) {
  /**
   * The size of the trigram data arrays
   *
   * @access   private
   * @var      int
   */
  this.threshold = 300;

  /**
   * stores the trigram ranks of the sample
   *
   * @access  private
   * @var     array
   */
  this.trigramRanks = {};

  /**
   * Whether the parser should compile trigrams
   *
   * @access  private
   * @var     bool
   */
  this.compileTrigram = true;

  this.compileUnicode = true;
  this.unicodeSkipAscii = true;
  this.unicodeBlocks = {};

  /**
   * Whether the trigram parser should pad the beginning of the string
   *
   * @access  private
   * @var     bool
   */
  this.trigramPadStart = false;

  this.trigram = {};

  /**
   * the piece of text being parsed
   *
   * @access  private
   * @var     string
   */

  /**
   * Constructor
   *
   * @access  private
   * @param   string  string to be parsed
   */
  this.string = string ? string.replace(/[~!@#$%^&*()_|+\-=?;:",.<>\{\}\[\]\\\/]/g, ' ') : '';
};

Parser.prototype = {
  /**
   * turn on/off padding the beginning of the sample string
   *
   * @access  public
   * @param   bool   true for on, false for off
   */
  setPadStart: function (bool) {
    this.trigramPadStart = bool || true;
  },

  /**
   * Returns the trigram ranks for the text sample
   *
   * @access  public
   * @return  array   trigram ranks in the text sample
   */
  getTrigramRanks: function () {
    return this.trigramRanks;
  },

  getBlockCount: function () {
    return dbUnicodeBlocks.length;
  },

  getUnicodeBlocks: function () {
    return this.unicodeBlocks;
  },

  /**
   * Executes the parsing operation
   *
   * Be sure to call the set*() functions to set options and the
   * prepare*() functions first to tell it what kind of data to compute
   *
   * Afterwards the get*() functions can be used to access the compiled
   * information.
   *
   * @access public
   */
  analyze: function () {
    var len = this.string.length
      , byteCounter = 0
      , a = ' ', b = ' '
      , dropone, c;

    if (this.compileUnicode) {
      var blocksCount = dbUnicodeBlocks.length;
    }

    // trigram startup
    if (this.compileTrigram) {
      // initialize them as blank so the parser will skip the first two
      // (since it skips trigrams with more than  2 contiguous spaces)
      a = ' ';
      b = ' ';

      // kludge
      // if it finds a valid trigram to start and the start pad option is
      // off, then set a variable that will be used to reduce this
      // trigram after parsing has finished
      if (!this.trigramPadStart) {
        a = this.string.charAt(byteCounter++).toLowerCase();

        if (a != ' ') {
          b = this.string.charAt(byteCounter).toLowerCase();
          dropone = ' ' + a + b;
        }

        byteCounter = 0;
        a = ' ';
        b = ' ';
      }
    }

    var skippedCount = 0;
    var unicodeChars = {};

    while (byteCounter < len) {
      c = this.string.charAt(byteCounter++).toLowerCase();

      // language trigram detection
      if (this.compileTrigram) {
        if (!(b == ' ' && (a == ' ' || c == ' '))) {
          var abc = a + b + c;
          this.trigram[abc] = this.trigram[abc] ? this.trigram[abc] += 1 : 1;
        }

        a = b;
        b = c;
      }

      if (this.compileUnicode) {
        var charCode = c.charCodeAt(0);

        if (this.unicodeSkipAscii
          && c.match(/[a-z ]/i)
          && (charCode < 65 || charCode > 122 || (charCode > 90 && charCode < 97))
          && c != "'") {

          skippedCount++;
          continue;
        }

        unicodeChars[c] = unicodeChars[c] ? unicodeChars[c] += 1 : 1;
      }
    }

    this.unicodeBlocks = {};

    if (this.compileUnicode) {
      var keys = Object.keys(unicodeChars)
        , keysLength = keys.length;

      for (var i = keysLength; i--;) {
        var unicode = keys[i].charCodeAt(0)
          , count = unicodeChars[keys[i]]
          , search = this.unicodeBlockName(unicode, blocksCount)
          , blockName = search != -1 ? search[2] : '[Malformatted]';

        this.unicodeBlocks[blockName] = this.unicodeBlocks[blockName] ? this.unicodeBlocks[blockName] += count : count;
      }
    }

    // trigram cleanup
    if (this.compileTrigram) {
      // pad the end
      if (b != ' ') {
        var ab = a + b + ' ';
        this.trigram[ab] = this.trigram[ab] ? this.trigram[ab] += 1 : 1;
      }

      // perl compatibility; Language::Guess does not pad the beginning
      // kludge
      if (typeof dropone != 'undefined' && this.trigram[dropone] == 1) {
        delete this.trigram[dropone];
      }

      if (this.trigram && Object.keys(this.trigram).length > 0) {
        this.trigramRanks = this.arrRank(this.trigram);
      } else {
        this.trigramRanks = {};
      }
    }
  },

  /**
   * Sorts an array by value breaking ties alphabetically
   *
   * @access private
   * @param arr the array to sort
   */
  bubleSort: function (arr) {
    // should do the same as this perl statement:
    // sort { $trigrams{$b} == $trigrams{$a} ?  $a cmp $b : $trigrams{$b} <=> $trigrams{$a} }

    // needs to sort by both key and value at once
    // using the key to break ties for the value

    // converts array into an array of arrays of each key and value
    // may be a better way of doing this
    var combined = [];

    for (var key in arr) {
      combined.push([key, arr[key]]);
    }

    combined = combined.sort(this.sortFunc);

    var replacement = {};

    var length = combined.length;

    for (var i = 0; i < length; i++) {
      replacement[combined[i][0]] = combined[i][1];
    }

    return replacement;
  },

  /**
   * Converts a set of trigrams from frequencies to ranks
   *
   * Thresholds (cuts off) the list at $this->_threshold
   *
   * @access  protected
   * @param   arr     array of trgram
   * @return  object  ranks of trigrams
   */
  arrRank: function (arr) {

    // sorts alphabetically first as a standard way of breaking rank ties
    arr = this.bubleSort(arr);

    var rank = {}, i = 0;

    for (var key in arr) {
      rank[key] = i++;

      // cut off at a standard threshold
      if (i >= this.threshold) {
        break;
      }
    }

    return rank;
  },

  /**
   * Sort function used by bubble sort
   *
   * Callback function for usort().
   *
   * @access   private
   * @param    a    first param passed by usort()
   * @param    b    second param passed by usort()
   * @return   int  1 if $a is greater, -1 if not
   *
   * @see      bubleSort()
   */
  sortFunc: function (a, b) {
    // each is actually a key/value pair, so that it can compare using both
    var aKey = a[0]
      , aValue = a[1]
      , bKey = b[0]
      , bValue = b[1];

    // if the values are the same, break ties using the key
    if (aValue == bValue) {
      return aKey.localeCompare(bKey);
    } else {
      return aValue > bValue ? -1 : 1;
    }
  },

  unicodeBlockName: function (unicode, blockCount) {
    if (unicode <= dbUnicodeBlocks[0][1]) {
      return dbUnicodeBlocks[0];
    }

    var high = blockCount ? blockCount - 1 : dbUnicodeBlocks.length
      , low = 1
      , mid;

    while (low <= high) {
      mid = Math.floor((low + high) / 2);

      if (unicode < dbUnicodeBlocks[mid][0]) {
        high = mid - 1;
      } else if (unicode > dbUnicodeBlocks[mid][1]) {
        low = mid + 1;
      } else {
        return dbUnicodeBlocks[mid];
      }
    }

    return -1;
  }
};
},{"../data/unicode_blocks.json":36}],41:[function(require,module,exports){
"use strict";
/* tslint:disable */
/* eslint-disable */
/**
 * OpenAI API
 * APIs for sampling from and fine-tuning language models
 *
 * The version of the OpenAPI document: 1.2.0
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIApi = exports.OpenAIApiFactory = exports.OpenAIApiFp = exports.OpenAIApiAxiosParamCreator = exports.CreateImageRequestResponseFormatEnum = exports.CreateImageRequestSizeEnum = exports.ChatCompletionResponseMessageRoleEnum = exports.ChatCompletionRequestMessageRoleEnum = void 0;
const axios_1 = require("axios");
// Some imports not used depending on template conditions
// @ts-ignore
const common_1 = require("./common");
// @ts-ignore
const base_1 = require("./base");
exports.ChatCompletionRequestMessageRoleEnum = {
    System: 'system',
    User: 'user',
    Assistant: 'assistant'
};
exports.ChatCompletionResponseMessageRoleEnum = {
    System: 'system',
    User: 'user',
    Assistant: 'assistant'
};
exports.CreateImageRequestSizeEnum = {
    _256x256: '256x256',
    _512x512: '512x512',
    _1024x1024: '1024x1024'
};
exports.CreateImageRequestResponseFormatEnum = {
    Url: 'url',
    B64Json: 'b64_json'
};
/**
 * OpenAIApi - axios parameter creator
 * @export
 */
exports.OpenAIApiAxiosParamCreator = function (configuration) {
    return {
        /**
         *
         * @summary Immediately cancel a fine-tune job.
         * @param {string} fineTuneId The ID of the fine-tune job to cancel
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        cancelFineTune: (fineTuneId, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'fineTuneId' is not null or undefined
            common_1.assertParamExists('cancelFineTune', 'fineTuneId', fineTuneId);
            const localVarPath = `/fine-tunes/{fine_tune_id}/cancel`
                .replace(`{${"fine_tune_id"}}`, encodeURIComponent(String(fineTuneId)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Answers the specified question using the provided documents and examples.  The endpoint first [searches](/docs/api-reference/searches) over provided documents or files to find relevant context. The relevant context is combined with the provided examples and question to create the prompt for [completion](/docs/api-reference/completions).
         * @param {CreateAnswerRequest} createAnswerRequest
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        createAnswer: (createAnswerRequest, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'createAnswerRequest' is not null or undefined
            common_1.assertParamExists('createAnswer', 'createAnswerRequest', createAnswerRequest);
            const localVarPath = `/answers`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            localVarHeaderParameter['Content-Type'] = 'application/json';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = common_1.serializeDataIfNeeded(createAnswerRequest, localVarRequestOptions, configuration);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Creates a completion for the chat message
         * @param {CreateChatCompletionRequest} createChatCompletionRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createChatCompletion: (createChatCompletionRequest, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'createChatCompletionRequest' is not null or undefined
            common_1.assertParamExists('createChatCompletion', 'createChatCompletionRequest', createChatCompletionRequest);
            const localVarPath = `/chat/completions`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            localVarHeaderParameter['Content-Type'] = 'application/json';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = common_1.serializeDataIfNeeded(createChatCompletionRequest, localVarRequestOptions, configuration);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Classifies the specified `query` using provided examples.  The endpoint first [searches](/docs/api-reference/searches) over the labeled examples to select the ones most relevant for the particular query. Then, the relevant examples are combined with the query to construct a prompt to produce the final label via the [completions](/docs/api-reference/completions) endpoint.  Labeled examples can be provided via an uploaded `file`, or explicitly listed in the request using the `examples` parameter for quick tests and small scale use cases.
         * @param {CreateClassificationRequest} createClassificationRequest
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        createClassification: (createClassificationRequest, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'createClassificationRequest' is not null or undefined
            common_1.assertParamExists('createClassification', 'createClassificationRequest', createClassificationRequest);
            const localVarPath = `/classifications`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            localVarHeaderParameter['Content-Type'] = 'application/json';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = common_1.serializeDataIfNeeded(createClassificationRequest, localVarRequestOptions, configuration);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Creates a completion for the provided prompt and parameters
         * @param {CreateCompletionRequest} createCompletionRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createCompletion: (createCompletionRequest, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'createCompletionRequest' is not null or undefined
            common_1.assertParamExists('createCompletion', 'createCompletionRequest', createCompletionRequest);
            const localVarPath = `/completions`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            localVarHeaderParameter['Content-Type'] = 'application/json';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = common_1.serializeDataIfNeeded(createCompletionRequest, localVarRequestOptions, configuration);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Creates a new edit for the provided input, instruction, and parameters.
         * @param {CreateEditRequest} createEditRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createEdit: (createEditRequest, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'createEditRequest' is not null or undefined
            common_1.assertParamExists('createEdit', 'createEditRequest', createEditRequest);
            const localVarPath = `/edits`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            localVarHeaderParameter['Content-Type'] = 'application/json';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = common_1.serializeDataIfNeeded(createEditRequest, localVarRequestOptions, configuration);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Creates an embedding vector representing the input text.
         * @param {CreateEmbeddingRequest} createEmbeddingRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createEmbedding: (createEmbeddingRequest, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'createEmbeddingRequest' is not null or undefined
            common_1.assertParamExists('createEmbedding', 'createEmbeddingRequest', createEmbeddingRequest);
            const localVarPath = `/embeddings`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            localVarHeaderParameter['Content-Type'] = 'application/json';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = common_1.serializeDataIfNeeded(createEmbeddingRequest, localVarRequestOptions, configuration);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Upload a file that contains document(s) to be used across various endpoints/features. Currently, the size of all the files uploaded by one organization can be up to 1 GB. Please contact us if you need to increase the storage limit.
         * @param {File} file Name of the [JSON Lines](https://jsonlines.readthedocs.io/en/latest/) file to be uploaded.  If the &#x60;purpose&#x60; is set to \\\&quot;fine-tune\\\&quot;, each line is a JSON record with \\\&quot;prompt\\\&quot; and \\\&quot;completion\\\&quot; fields representing your [training examples](/docs/guides/fine-tuning/prepare-training-data).
         * @param {string} purpose The intended purpose of the uploaded documents.  Use \\\&quot;fine-tune\\\&quot; for [Fine-tuning](/docs/api-reference/fine-tunes). This allows us to validate the format of the uploaded file.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createFile: (file, purpose, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'file' is not null or undefined
            common_1.assertParamExists('createFile', 'file', file);
            // verify required parameter 'purpose' is not null or undefined
            common_1.assertParamExists('createFile', 'purpose', purpose);
            const localVarPath = `/files`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            const localVarFormParams = new ((configuration && configuration.formDataCtor) || FormData)();
            if (file !== undefined) {
                localVarFormParams.append('file', file);
            }
            if (purpose !== undefined) {
                localVarFormParams.append('purpose', purpose);
            }
            localVarHeaderParameter['Content-Type'] = 'multipart/form-data';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), localVarFormParams.getHeaders()), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = localVarFormParams;
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Creates a job that fine-tunes a specified model from a given dataset.  Response includes details of the enqueued job including job status and the name of the fine-tuned models once complete.  [Learn more about Fine-tuning](/docs/guides/fine-tuning)
         * @param {CreateFineTuneRequest} createFineTuneRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createFineTune: (createFineTuneRequest, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'createFineTuneRequest' is not null or undefined
            common_1.assertParamExists('createFineTune', 'createFineTuneRequest', createFineTuneRequest);
            const localVarPath = `/fine-tunes`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            localVarHeaderParameter['Content-Type'] = 'application/json';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = common_1.serializeDataIfNeeded(createFineTuneRequest, localVarRequestOptions, configuration);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Creates an image given a prompt.
         * @param {CreateImageRequest} createImageRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createImage: (createImageRequest, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'createImageRequest' is not null or undefined
            common_1.assertParamExists('createImage', 'createImageRequest', createImageRequest);
            const localVarPath = `/images/generations`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            localVarHeaderParameter['Content-Type'] = 'application/json';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = common_1.serializeDataIfNeeded(createImageRequest, localVarRequestOptions, configuration);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Creates an edited or extended image given an original image and a prompt.
         * @param {File} image The image to edit. Must be a valid PNG file, less than 4MB, and square. If mask is not provided, image must have transparency, which will be used as the mask.
         * @param {string} prompt A text description of the desired image(s). The maximum length is 1000 characters.
         * @param {File} [mask] An additional image whose fully transparent areas (e.g. where alpha is zero) indicate where &#x60;image&#x60; should be edited. Must be a valid PNG file, less than 4MB, and have the same dimensions as &#x60;image&#x60;.
         * @param {number} [n] The number of images to generate. Must be between 1 and 10.
         * @param {string} [size] The size of the generated images. Must be one of &#x60;256x256&#x60;, &#x60;512x512&#x60;, or &#x60;1024x1024&#x60;.
         * @param {string} [responseFormat] The format in which the generated images are returned. Must be one of &#x60;url&#x60; or &#x60;b64_json&#x60;.
         * @param {string} [user] A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. [Learn more](/docs/guides/safety-best-practices/end-user-ids).
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createImageEdit: (image, prompt, mask, n, size, responseFormat, user, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'image' is not null or undefined
            common_1.assertParamExists('createImageEdit', 'image', image);
            // verify required parameter 'prompt' is not null or undefined
            common_1.assertParamExists('createImageEdit', 'prompt', prompt);
            const localVarPath = `/images/edits`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            const localVarFormParams = new ((configuration && configuration.formDataCtor) || FormData)();
            if (image !== undefined) {
                localVarFormParams.append('image', image);
            }
            if (mask !== undefined) {
                localVarFormParams.append('mask', mask);
            }
            if (prompt !== undefined) {
                localVarFormParams.append('prompt', prompt);
            }
            if (n !== undefined) {
                localVarFormParams.append('n', n);
            }
            if (size !== undefined) {
                localVarFormParams.append('size', size);
            }
            if (responseFormat !== undefined) {
                localVarFormParams.append('response_format', responseFormat);
            }
            if (user !== undefined) {
                localVarFormParams.append('user', user);
            }
            localVarHeaderParameter['Content-Type'] = 'multipart/form-data';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), localVarFormParams.getHeaders()), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = localVarFormParams;
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Creates a variation of a given image.
         * @param {File} image The image to use as the basis for the variation(s). Must be a valid PNG file, less than 4MB, and square.
         * @param {number} [n] The number of images to generate. Must be between 1 and 10.
         * @param {string} [size] The size of the generated images. Must be one of &#x60;256x256&#x60;, &#x60;512x512&#x60;, or &#x60;1024x1024&#x60;.
         * @param {string} [responseFormat] The format in which the generated images are returned. Must be one of &#x60;url&#x60; or &#x60;b64_json&#x60;.
         * @param {string} [user] A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. [Learn more](/docs/guides/safety-best-practices/end-user-ids).
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createImageVariation: (image, n, size, responseFormat, user, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'image' is not null or undefined
            common_1.assertParamExists('createImageVariation', 'image', image);
            const localVarPath = `/images/variations`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            const localVarFormParams = new ((configuration && configuration.formDataCtor) || FormData)();
            if (image !== undefined) {
                localVarFormParams.append('image', image);
            }
            if (n !== undefined) {
                localVarFormParams.append('n', n);
            }
            if (size !== undefined) {
                localVarFormParams.append('size', size);
            }
            if (responseFormat !== undefined) {
                localVarFormParams.append('response_format', responseFormat);
            }
            if (user !== undefined) {
                localVarFormParams.append('user', user);
            }
            localVarHeaderParameter['Content-Type'] = 'multipart/form-data';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), localVarFormParams.getHeaders()), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = localVarFormParams;
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Classifies if text violates OpenAI\'s Content Policy
         * @param {CreateModerationRequest} createModerationRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createModeration: (createModerationRequest, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'createModerationRequest' is not null or undefined
            common_1.assertParamExists('createModeration', 'createModerationRequest', createModerationRequest);
            const localVarPath = `/moderations`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            localVarHeaderParameter['Content-Type'] = 'application/json';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = common_1.serializeDataIfNeeded(createModerationRequest, localVarRequestOptions, configuration);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary The search endpoint computes similarity scores between provided query and documents. Documents can be passed directly to the API if there are no more than 200 of them.  To go beyond the 200 document limit, documents can be processed offline and then used for efficient retrieval at query time. When `file` is set, the search endpoint searches over all the documents in the given file and returns up to the `max_rerank` number of documents. These documents will be returned along with their search scores.  The similarity score is a positive score that usually ranges from 0 to 300 (but can sometimes go higher), where a score above 200 usually means the document is semantically similar to the query.
         * @param {string} engineId The ID of the engine to use for this request.  You can select one of &#x60;ada&#x60;, &#x60;babbage&#x60;, &#x60;curie&#x60;, or &#x60;davinci&#x60;.
         * @param {CreateSearchRequest} createSearchRequest
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        createSearch: (engineId, createSearchRequest, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'engineId' is not null or undefined
            common_1.assertParamExists('createSearch', 'engineId', engineId);
            // verify required parameter 'createSearchRequest' is not null or undefined
            common_1.assertParamExists('createSearch', 'createSearchRequest', createSearchRequest);
            const localVarPath = `/engines/{engine_id}/search`
                .replace(`{${"engine_id"}}`, encodeURIComponent(String(engineId)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            localVarHeaderParameter['Content-Type'] = 'application/json';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = common_1.serializeDataIfNeeded(createSearchRequest, localVarRequestOptions, configuration);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Transcribes audio into the input language.
         * @param {File} file The audio file to transcribe, in one of these formats: mp3, mp4, mpeg, mpga, m4a, wav, or webm.
         * @param {string} model ID of the model to use. Only &#x60;whisper-1&#x60; is currently available.
         * @param {string} [prompt] An optional text to guide the model\\\&#39;s style or continue a previous audio segment. The [prompt](/docs/guides/speech-to-text/prompting) should match the audio language.
         * @param {string} [responseFormat] The format of the transcript output, in one of these options: json, text, srt, verbose_json, or vtt.
         * @param {number} [temperature] The sampling temperature, between 0 and 1. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. If set to 0, the model will use [log probability](https://en.wikipedia.org/wiki/Log_probability) to automatically increase the temperature until certain thresholds are hit.
         * @param {string} [language] The language of the input audio. Supplying the input language in [ISO-639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) format will improve accuracy and latency.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createTranscription: (file, model, prompt, responseFormat, temperature, language, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'file' is not null or undefined
            common_1.assertParamExists('createTranscription', 'file', file);
            // verify required parameter 'model' is not null or undefined
            common_1.assertParamExists('createTranscription', 'model', model);
            const localVarPath = `/audio/transcriptions`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            const localVarFormParams = new ((configuration && configuration.formDataCtor) || FormData)();
            if (file !== undefined) {
                localVarFormParams.append('file', file);
            }
            if (model !== undefined) {
                localVarFormParams.append('model', model);
            }
            if (prompt !== undefined) {
                localVarFormParams.append('prompt', prompt);
            }
            if (responseFormat !== undefined) {
                localVarFormParams.append('response_format', responseFormat);
            }
            if (temperature !== undefined) {
                localVarFormParams.append('temperature', temperature);
            }
            if (language !== undefined) {
                localVarFormParams.append('language', language);
            }
            localVarHeaderParameter['Content-Type'] = 'multipart/form-data';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), localVarFormParams.getHeaders()), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = localVarFormParams;
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Translates audio into into English.
         * @param {File} file The audio file to translate, in one of these formats: mp3, mp4, mpeg, mpga, m4a, wav, or webm.
         * @param {string} model ID of the model to use. Only &#x60;whisper-1&#x60; is currently available.
         * @param {string} [prompt] An optional text to guide the model\\\&#39;s style or continue a previous audio segment. The [prompt](/docs/guides/speech-to-text/prompting) should be in English.
         * @param {string} [responseFormat] The format of the transcript output, in one of these options: json, text, srt, verbose_json, or vtt.
         * @param {number} [temperature] The sampling temperature, between 0 and 1. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. If set to 0, the model will use [log probability](https://en.wikipedia.org/wiki/Log_probability) to automatically increase the temperature until certain thresholds are hit.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createTranslation: (file, model, prompt, responseFormat, temperature, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'file' is not null or undefined
            common_1.assertParamExists('createTranslation', 'file', file);
            // verify required parameter 'model' is not null or undefined
            common_1.assertParamExists('createTranslation', 'model', model);
            const localVarPath = `/audio/translations`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'POST' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            const localVarFormParams = new ((configuration && configuration.formDataCtor) || FormData)();
            if (file !== undefined) {
                localVarFormParams.append('file', file);
            }
            if (model !== undefined) {
                localVarFormParams.append('model', model);
            }
            if (prompt !== undefined) {
                localVarFormParams.append('prompt', prompt);
            }
            if (responseFormat !== undefined) {
                localVarFormParams.append('response_format', responseFormat);
            }
            if (temperature !== undefined) {
                localVarFormParams.append('temperature', temperature);
            }
            localVarHeaderParameter['Content-Type'] = 'multipart/form-data';
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), localVarFormParams.getHeaders()), headersFromBaseOptions), options.headers);
            localVarRequestOptions.data = localVarFormParams;
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Delete a file.
         * @param {string} fileId The ID of the file to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        deleteFile: (fileId, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'fileId' is not null or undefined
            common_1.assertParamExists('deleteFile', 'fileId', fileId);
            const localVarPath = `/files/{file_id}`
                .replace(`{${"file_id"}}`, encodeURIComponent(String(fileId)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'DELETE' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Delete a fine-tuned model. You must have the Owner role in your organization.
         * @param {string} model The model to delete
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        deleteModel: (model, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'model' is not null or undefined
            common_1.assertParamExists('deleteModel', 'model', model);
            const localVarPath = `/models/{model}`
                .replace(`{${"model"}}`, encodeURIComponent(String(model)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'DELETE' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Returns the contents of the specified file
         * @param {string} fileId The ID of the file to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        downloadFile: (fileId, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'fileId' is not null or undefined
            common_1.assertParamExists('downloadFile', 'fileId', fileId);
            const localVarPath = `/files/{file_id}/content`
                .replace(`{${"file_id"}}`, encodeURIComponent(String(fileId)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'GET' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Lists the currently available (non-finetuned) models, and provides basic information about each one such as the owner and availability.
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        listEngines: (options = {}) => __awaiter(this, void 0, void 0, function* () {
            const localVarPath = `/engines`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'GET' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Returns a list of files that belong to the user\'s organization.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listFiles: (options = {}) => __awaiter(this, void 0, void 0, function* () {
            const localVarPath = `/files`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'GET' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Get fine-grained status updates for a fine-tune job.
         * @param {string} fineTuneId The ID of the fine-tune job to get events for.
         * @param {boolean} [stream] Whether to stream events for the fine-tune job. If set to true, events will be sent as data-only [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#Event_stream_format) as they become available. The stream will terminate with a &#x60;data: [DONE]&#x60; message when the job is finished (succeeded, cancelled, or failed).  If set to false, only events generated so far will be returned.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listFineTuneEvents: (fineTuneId, stream, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'fineTuneId' is not null or undefined
            common_1.assertParamExists('listFineTuneEvents', 'fineTuneId', fineTuneId);
            const localVarPath = `/fine-tunes/{fine_tune_id}/events`
                .replace(`{${"fine_tune_id"}}`, encodeURIComponent(String(fineTuneId)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'GET' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            if (stream !== undefined) {
                localVarQueryParameter['stream'] = stream;
            }
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary List your organization\'s fine-tuning jobs
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listFineTunes: (options = {}) => __awaiter(this, void 0, void 0, function* () {
            const localVarPath = `/fine-tunes`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'GET' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Lists the currently available models, and provides basic information about each one such as the owner and availability.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listModels: (options = {}) => __awaiter(this, void 0, void 0, function* () {
            const localVarPath = `/models`;
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'GET' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Retrieves a model instance, providing basic information about it such as the owner and availability.
         * @param {string} engineId The ID of the engine to use for this request
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        retrieveEngine: (engineId, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'engineId' is not null or undefined
            common_1.assertParamExists('retrieveEngine', 'engineId', engineId);
            const localVarPath = `/engines/{engine_id}`
                .replace(`{${"engine_id"}}`, encodeURIComponent(String(engineId)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'GET' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Returns information about a specific file.
         * @param {string} fileId The ID of the file to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        retrieveFile: (fileId, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'fileId' is not null or undefined
            common_1.assertParamExists('retrieveFile', 'fileId', fileId);
            const localVarPath = `/files/{file_id}`
                .replace(`{${"file_id"}}`, encodeURIComponent(String(fileId)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'GET' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Gets info about the fine-tune job.  [Learn more about Fine-tuning](/docs/guides/fine-tuning)
         * @param {string} fineTuneId The ID of the fine-tune job
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        retrieveFineTune: (fineTuneId, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'fineTuneId' is not null or undefined
            common_1.assertParamExists('retrieveFineTune', 'fineTuneId', fineTuneId);
            const localVarPath = `/fine-tunes/{fine_tune_id}`
                .replace(`{${"fine_tune_id"}}`, encodeURIComponent(String(fineTuneId)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'GET' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
        /**
         *
         * @summary Retrieves a model instance, providing basic information about the model such as the owner and permissioning.
         * @param {string} model The ID of the model to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        retrieveModel: (model, options = {}) => __awaiter(this, void 0, void 0, function* () {
            // verify required parameter 'model' is not null or undefined
            common_1.assertParamExists('retrieveModel', 'model', model);
            const localVarPath = `/models/{model}`
                .replace(`{${"model"}}`, encodeURIComponent(String(model)));
            // use dummy base URL string because the URL constructor only accepts absolute URLs.
            const localVarUrlObj = new URL(localVarPath, common_1.DUMMY_BASE_URL);
            let baseOptions;
            if (configuration) {
                baseOptions = configuration.baseOptions;
            }
            const localVarRequestOptions = Object.assign(Object.assign({ method: 'GET' }, baseOptions), options);
            const localVarHeaderParameter = {};
            const localVarQueryParameter = {};
            common_1.setSearchParams(localVarUrlObj, localVarQueryParameter);
            let headersFromBaseOptions = baseOptions && baseOptions.headers ? baseOptions.headers : {};
            localVarRequestOptions.headers = Object.assign(Object.assign(Object.assign({}, localVarHeaderParameter), headersFromBaseOptions), options.headers);
            return {
                url: common_1.toPathString(localVarUrlObj),
                options: localVarRequestOptions,
            };
        }),
    };
};
/**
 * OpenAIApi - functional programming interface
 * @export
 */
exports.OpenAIApiFp = function (configuration) {
    const localVarAxiosParamCreator = exports.OpenAIApiAxiosParamCreator(configuration);
    return {
        /**
         *
         * @summary Immediately cancel a fine-tune job.
         * @param {string} fineTuneId The ID of the fine-tune job to cancel
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        cancelFineTune(fineTuneId, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.cancelFineTune(fineTuneId, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Answers the specified question using the provided documents and examples.  The endpoint first [searches](/docs/api-reference/searches) over provided documents or files to find relevant context. The relevant context is combined with the provided examples and question to create the prompt for [completion](/docs/api-reference/completions).
         * @param {CreateAnswerRequest} createAnswerRequest
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        createAnswer(createAnswerRequest, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createAnswer(createAnswerRequest, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Creates a completion for the chat message
         * @param {CreateChatCompletionRequest} createChatCompletionRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createChatCompletion(createChatCompletionRequest, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createChatCompletion(createChatCompletionRequest, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Classifies the specified `query` using provided examples.  The endpoint first [searches](/docs/api-reference/searches) over the labeled examples to select the ones most relevant for the particular query. Then, the relevant examples are combined with the query to construct a prompt to produce the final label via the [completions](/docs/api-reference/completions) endpoint.  Labeled examples can be provided via an uploaded `file`, or explicitly listed in the request using the `examples` parameter for quick tests and small scale use cases.
         * @param {CreateClassificationRequest} createClassificationRequest
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        createClassification(createClassificationRequest, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createClassification(createClassificationRequest, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Creates a completion for the provided prompt and parameters
         * @param {CreateCompletionRequest} createCompletionRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createCompletion(createCompletionRequest, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createCompletion(createCompletionRequest, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Creates a new edit for the provided input, instruction, and parameters.
         * @param {CreateEditRequest} createEditRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createEdit(createEditRequest, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createEdit(createEditRequest, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Creates an embedding vector representing the input text.
         * @param {CreateEmbeddingRequest} createEmbeddingRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createEmbedding(createEmbeddingRequest, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createEmbedding(createEmbeddingRequest, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Upload a file that contains document(s) to be used across various endpoints/features. Currently, the size of all the files uploaded by one organization can be up to 1 GB. Please contact us if you need to increase the storage limit.
         * @param {File} file Name of the [JSON Lines](https://jsonlines.readthedocs.io/en/latest/) file to be uploaded.  If the &#x60;purpose&#x60; is set to \\\&quot;fine-tune\\\&quot;, each line is a JSON record with \\\&quot;prompt\\\&quot; and \\\&quot;completion\\\&quot; fields representing your [training examples](/docs/guides/fine-tuning/prepare-training-data).
         * @param {string} purpose The intended purpose of the uploaded documents.  Use \\\&quot;fine-tune\\\&quot; for [Fine-tuning](/docs/api-reference/fine-tunes). This allows us to validate the format of the uploaded file.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createFile(file, purpose, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createFile(file, purpose, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Creates a job that fine-tunes a specified model from a given dataset.  Response includes details of the enqueued job including job status and the name of the fine-tuned models once complete.  [Learn more about Fine-tuning](/docs/guides/fine-tuning)
         * @param {CreateFineTuneRequest} createFineTuneRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createFineTune(createFineTuneRequest, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createFineTune(createFineTuneRequest, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Creates an image given a prompt.
         * @param {CreateImageRequest} createImageRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createImage(createImageRequest, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createImage(createImageRequest, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Creates an edited or extended image given an original image and a prompt.
         * @param {File} image The image to edit. Must be a valid PNG file, less than 4MB, and square. If mask is not provided, image must have transparency, which will be used as the mask.
         * @param {string} prompt A text description of the desired image(s). The maximum length is 1000 characters.
         * @param {File} [mask] An additional image whose fully transparent areas (e.g. where alpha is zero) indicate where &#x60;image&#x60; should be edited. Must be a valid PNG file, less than 4MB, and have the same dimensions as &#x60;image&#x60;.
         * @param {number} [n] The number of images to generate. Must be between 1 and 10.
         * @param {string} [size] The size of the generated images. Must be one of &#x60;256x256&#x60;, &#x60;512x512&#x60;, or &#x60;1024x1024&#x60;.
         * @param {string} [responseFormat] The format in which the generated images are returned. Must be one of &#x60;url&#x60; or &#x60;b64_json&#x60;.
         * @param {string} [user] A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. [Learn more](/docs/guides/safety-best-practices/end-user-ids).
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createImageEdit(image, prompt, mask, n, size, responseFormat, user, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createImageEdit(image, prompt, mask, n, size, responseFormat, user, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Creates a variation of a given image.
         * @param {File} image The image to use as the basis for the variation(s). Must be a valid PNG file, less than 4MB, and square.
         * @param {number} [n] The number of images to generate. Must be between 1 and 10.
         * @param {string} [size] The size of the generated images. Must be one of &#x60;256x256&#x60;, &#x60;512x512&#x60;, or &#x60;1024x1024&#x60;.
         * @param {string} [responseFormat] The format in which the generated images are returned. Must be one of &#x60;url&#x60; or &#x60;b64_json&#x60;.
         * @param {string} [user] A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. [Learn more](/docs/guides/safety-best-practices/end-user-ids).
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createImageVariation(image, n, size, responseFormat, user, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createImageVariation(image, n, size, responseFormat, user, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Classifies if text violates OpenAI\'s Content Policy
         * @param {CreateModerationRequest} createModerationRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createModeration(createModerationRequest, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createModeration(createModerationRequest, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary The search endpoint computes similarity scores between provided query and documents. Documents can be passed directly to the API if there are no more than 200 of them.  To go beyond the 200 document limit, documents can be processed offline and then used for efficient retrieval at query time. When `file` is set, the search endpoint searches over all the documents in the given file and returns up to the `max_rerank` number of documents. These documents will be returned along with their search scores.  The similarity score is a positive score that usually ranges from 0 to 300 (but can sometimes go higher), where a score above 200 usually means the document is semantically similar to the query.
         * @param {string} engineId The ID of the engine to use for this request.  You can select one of &#x60;ada&#x60;, &#x60;babbage&#x60;, &#x60;curie&#x60;, or &#x60;davinci&#x60;.
         * @param {CreateSearchRequest} createSearchRequest
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        createSearch(engineId, createSearchRequest, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createSearch(engineId, createSearchRequest, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Transcribes audio into the input language.
         * @param {File} file The audio file to transcribe, in one of these formats: mp3, mp4, mpeg, mpga, m4a, wav, or webm.
         * @param {string} model ID of the model to use. Only &#x60;whisper-1&#x60; is currently available.
         * @param {string} [prompt] An optional text to guide the model\\\&#39;s style or continue a previous audio segment. The [prompt](/docs/guides/speech-to-text/prompting) should match the audio language.
         * @param {string} [responseFormat] The format of the transcript output, in one of these options: json, text, srt, verbose_json, or vtt.
         * @param {number} [temperature] The sampling temperature, between 0 and 1. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. If set to 0, the model will use [log probability](https://en.wikipedia.org/wiki/Log_probability) to automatically increase the temperature until certain thresholds are hit.
         * @param {string} [language] The language of the input audio. Supplying the input language in [ISO-639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) format will improve accuracy and latency.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createTranscription(file, model, prompt, responseFormat, temperature, language, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createTranscription(file, model, prompt, responseFormat, temperature, language, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Translates audio into into English.
         * @param {File} file The audio file to translate, in one of these formats: mp3, mp4, mpeg, mpga, m4a, wav, or webm.
         * @param {string} model ID of the model to use. Only &#x60;whisper-1&#x60; is currently available.
         * @param {string} [prompt] An optional text to guide the model\\\&#39;s style or continue a previous audio segment. The [prompt](/docs/guides/speech-to-text/prompting) should be in English.
         * @param {string} [responseFormat] The format of the transcript output, in one of these options: json, text, srt, verbose_json, or vtt.
         * @param {number} [temperature] The sampling temperature, between 0 and 1. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. If set to 0, the model will use [log probability](https://en.wikipedia.org/wiki/Log_probability) to automatically increase the temperature until certain thresholds are hit.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createTranslation(file, model, prompt, responseFormat, temperature, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.createTranslation(file, model, prompt, responseFormat, temperature, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Delete a file.
         * @param {string} fileId The ID of the file to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        deleteFile(fileId, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.deleteFile(fileId, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Delete a fine-tuned model. You must have the Owner role in your organization.
         * @param {string} model The model to delete
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        deleteModel(model, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.deleteModel(model, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Returns the contents of the specified file
         * @param {string} fileId The ID of the file to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        downloadFile(fileId, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.downloadFile(fileId, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Lists the currently available (non-finetuned) models, and provides basic information about each one such as the owner and availability.
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        listEngines(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.listEngines(options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Returns a list of files that belong to the user\'s organization.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listFiles(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.listFiles(options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Get fine-grained status updates for a fine-tune job.
         * @param {string} fineTuneId The ID of the fine-tune job to get events for.
         * @param {boolean} [stream] Whether to stream events for the fine-tune job. If set to true, events will be sent as data-only [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#Event_stream_format) as they become available. The stream will terminate with a &#x60;data: [DONE]&#x60; message when the job is finished (succeeded, cancelled, or failed).  If set to false, only events generated so far will be returned.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listFineTuneEvents(fineTuneId, stream, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.listFineTuneEvents(fineTuneId, stream, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary List your organization\'s fine-tuning jobs
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listFineTunes(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.listFineTunes(options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Lists the currently available models, and provides basic information about each one such as the owner and availability.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listModels(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.listModels(options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Retrieves a model instance, providing basic information about it such as the owner and availability.
         * @param {string} engineId The ID of the engine to use for this request
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        retrieveEngine(engineId, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.retrieveEngine(engineId, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Returns information about a specific file.
         * @param {string} fileId The ID of the file to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        retrieveFile(fileId, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.retrieveFile(fileId, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Gets info about the fine-tune job.  [Learn more about Fine-tuning](/docs/guides/fine-tuning)
         * @param {string} fineTuneId The ID of the fine-tune job
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        retrieveFineTune(fineTuneId, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.retrieveFineTune(fineTuneId, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
        /**
         *
         * @summary Retrieves a model instance, providing basic information about the model such as the owner and permissioning.
         * @param {string} model The ID of the model to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        retrieveModel(model, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const localVarAxiosArgs = yield localVarAxiosParamCreator.retrieveModel(model, options);
                return common_1.createRequestFunction(localVarAxiosArgs, axios_1.default, base_1.BASE_PATH, configuration);
            });
        },
    };
};
/**
 * OpenAIApi - factory interface
 * @export
 */
exports.OpenAIApiFactory = function (configuration, basePath, axios) {
    const localVarFp = exports.OpenAIApiFp(configuration);
    return {
        /**
         *
         * @summary Immediately cancel a fine-tune job.
         * @param {string} fineTuneId The ID of the fine-tune job to cancel
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        cancelFineTune(fineTuneId, options) {
            return localVarFp.cancelFineTune(fineTuneId, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Answers the specified question using the provided documents and examples.  The endpoint first [searches](/docs/api-reference/searches) over provided documents or files to find relevant context. The relevant context is combined with the provided examples and question to create the prompt for [completion](/docs/api-reference/completions).
         * @param {CreateAnswerRequest} createAnswerRequest
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        createAnswer(createAnswerRequest, options) {
            return localVarFp.createAnswer(createAnswerRequest, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Creates a completion for the chat message
         * @param {CreateChatCompletionRequest} createChatCompletionRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createChatCompletion(createChatCompletionRequest, options) {
            return localVarFp.createChatCompletion(createChatCompletionRequest, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Classifies the specified `query` using provided examples.  The endpoint first [searches](/docs/api-reference/searches) over the labeled examples to select the ones most relevant for the particular query. Then, the relevant examples are combined with the query to construct a prompt to produce the final label via the [completions](/docs/api-reference/completions) endpoint.  Labeled examples can be provided via an uploaded `file`, or explicitly listed in the request using the `examples` parameter for quick tests and small scale use cases.
         * @param {CreateClassificationRequest} createClassificationRequest
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        createClassification(createClassificationRequest, options) {
            return localVarFp.createClassification(createClassificationRequest, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Creates a completion for the provided prompt and parameters
         * @param {CreateCompletionRequest} createCompletionRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createCompletion(createCompletionRequest, options) {
            return localVarFp.createCompletion(createCompletionRequest, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Creates a new edit for the provided input, instruction, and parameters.
         * @param {CreateEditRequest} createEditRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createEdit(createEditRequest, options) {
            return localVarFp.createEdit(createEditRequest, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Creates an embedding vector representing the input text.
         * @param {CreateEmbeddingRequest} createEmbeddingRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createEmbedding(createEmbeddingRequest, options) {
            return localVarFp.createEmbedding(createEmbeddingRequest, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Upload a file that contains document(s) to be used across various endpoints/features. Currently, the size of all the files uploaded by one organization can be up to 1 GB. Please contact us if you need to increase the storage limit.
         * @param {File} file Name of the [JSON Lines](https://jsonlines.readthedocs.io/en/latest/) file to be uploaded.  If the &#x60;purpose&#x60; is set to \\\&quot;fine-tune\\\&quot;, each line is a JSON record with \\\&quot;prompt\\\&quot; and \\\&quot;completion\\\&quot; fields representing your [training examples](/docs/guides/fine-tuning/prepare-training-data).
         * @param {string} purpose The intended purpose of the uploaded documents.  Use \\\&quot;fine-tune\\\&quot; for [Fine-tuning](/docs/api-reference/fine-tunes). This allows us to validate the format of the uploaded file.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createFile(file, purpose, options) {
            return localVarFp.createFile(file, purpose, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Creates a job that fine-tunes a specified model from a given dataset.  Response includes details of the enqueued job including job status and the name of the fine-tuned models once complete.  [Learn more about Fine-tuning](/docs/guides/fine-tuning)
         * @param {CreateFineTuneRequest} createFineTuneRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createFineTune(createFineTuneRequest, options) {
            return localVarFp.createFineTune(createFineTuneRequest, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Creates an image given a prompt.
         * @param {CreateImageRequest} createImageRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createImage(createImageRequest, options) {
            return localVarFp.createImage(createImageRequest, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Creates an edited or extended image given an original image and a prompt.
         * @param {File} image The image to edit. Must be a valid PNG file, less than 4MB, and square. If mask is not provided, image must have transparency, which will be used as the mask.
         * @param {string} prompt A text description of the desired image(s). The maximum length is 1000 characters.
         * @param {File} [mask] An additional image whose fully transparent areas (e.g. where alpha is zero) indicate where &#x60;image&#x60; should be edited. Must be a valid PNG file, less than 4MB, and have the same dimensions as &#x60;image&#x60;.
         * @param {number} [n] The number of images to generate. Must be between 1 and 10.
         * @param {string} [size] The size of the generated images. Must be one of &#x60;256x256&#x60;, &#x60;512x512&#x60;, or &#x60;1024x1024&#x60;.
         * @param {string} [responseFormat] The format in which the generated images are returned. Must be one of &#x60;url&#x60; or &#x60;b64_json&#x60;.
         * @param {string} [user] A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. [Learn more](/docs/guides/safety-best-practices/end-user-ids).
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createImageEdit(image, prompt, mask, n, size, responseFormat, user, options) {
            return localVarFp.createImageEdit(image, prompt, mask, n, size, responseFormat, user, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Creates a variation of a given image.
         * @param {File} image The image to use as the basis for the variation(s). Must be a valid PNG file, less than 4MB, and square.
         * @param {number} [n] The number of images to generate. Must be between 1 and 10.
         * @param {string} [size] The size of the generated images. Must be one of &#x60;256x256&#x60;, &#x60;512x512&#x60;, or &#x60;1024x1024&#x60;.
         * @param {string} [responseFormat] The format in which the generated images are returned. Must be one of &#x60;url&#x60; or &#x60;b64_json&#x60;.
         * @param {string} [user] A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. [Learn more](/docs/guides/safety-best-practices/end-user-ids).
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createImageVariation(image, n, size, responseFormat, user, options) {
            return localVarFp.createImageVariation(image, n, size, responseFormat, user, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Classifies if text violates OpenAI\'s Content Policy
         * @param {CreateModerationRequest} createModerationRequest
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createModeration(createModerationRequest, options) {
            return localVarFp.createModeration(createModerationRequest, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary The search endpoint computes similarity scores between provided query and documents. Documents can be passed directly to the API if there are no more than 200 of them.  To go beyond the 200 document limit, documents can be processed offline and then used for efficient retrieval at query time. When `file` is set, the search endpoint searches over all the documents in the given file and returns up to the `max_rerank` number of documents. These documents will be returned along with their search scores.  The similarity score is a positive score that usually ranges from 0 to 300 (but can sometimes go higher), where a score above 200 usually means the document is semantically similar to the query.
         * @param {string} engineId The ID of the engine to use for this request.  You can select one of &#x60;ada&#x60;, &#x60;babbage&#x60;, &#x60;curie&#x60;, or &#x60;davinci&#x60;.
         * @param {CreateSearchRequest} createSearchRequest
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        createSearch(engineId, createSearchRequest, options) {
            return localVarFp.createSearch(engineId, createSearchRequest, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Transcribes audio into the input language.
         * @param {File} file The audio file to transcribe, in one of these formats: mp3, mp4, mpeg, mpga, m4a, wav, or webm.
         * @param {string} model ID of the model to use. Only &#x60;whisper-1&#x60; is currently available.
         * @param {string} [prompt] An optional text to guide the model\\\&#39;s style or continue a previous audio segment. The [prompt](/docs/guides/speech-to-text/prompting) should match the audio language.
         * @param {string} [responseFormat] The format of the transcript output, in one of these options: json, text, srt, verbose_json, or vtt.
         * @param {number} [temperature] The sampling temperature, between 0 and 1. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. If set to 0, the model will use [log probability](https://en.wikipedia.org/wiki/Log_probability) to automatically increase the temperature until certain thresholds are hit.
         * @param {string} [language] The language of the input audio. Supplying the input language in [ISO-639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) format will improve accuracy and latency.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createTranscription(file, model, prompt, responseFormat, temperature, language, options) {
            return localVarFp.createTranscription(file, model, prompt, responseFormat, temperature, language, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Translates audio into into English.
         * @param {File} file The audio file to translate, in one of these formats: mp3, mp4, mpeg, mpga, m4a, wav, or webm.
         * @param {string} model ID of the model to use. Only &#x60;whisper-1&#x60; is currently available.
         * @param {string} [prompt] An optional text to guide the model\\\&#39;s style or continue a previous audio segment. The [prompt](/docs/guides/speech-to-text/prompting) should be in English.
         * @param {string} [responseFormat] The format of the transcript output, in one of these options: json, text, srt, verbose_json, or vtt.
         * @param {number} [temperature] The sampling temperature, between 0 and 1. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. If set to 0, the model will use [log probability](https://en.wikipedia.org/wiki/Log_probability) to automatically increase the temperature until certain thresholds are hit.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        createTranslation(file, model, prompt, responseFormat, temperature, options) {
            return localVarFp.createTranslation(file, model, prompt, responseFormat, temperature, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Delete a file.
         * @param {string} fileId The ID of the file to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        deleteFile(fileId, options) {
            return localVarFp.deleteFile(fileId, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Delete a fine-tuned model. You must have the Owner role in your organization.
         * @param {string} model The model to delete
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        deleteModel(model, options) {
            return localVarFp.deleteModel(model, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Returns the contents of the specified file
         * @param {string} fileId The ID of the file to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        downloadFile(fileId, options) {
            return localVarFp.downloadFile(fileId, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Lists the currently available (non-finetuned) models, and provides basic information about each one such as the owner and availability.
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        listEngines(options) {
            return localVarFp.listEngines(options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Returns a list of files that belong to the user\'s organization.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listFiles(options) {
            return localVarFp.listFiles(options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Get fine-grained status updates for a fine-tune job.
         * @param {string} fineTuneId The ID of the fine-tune job to get events for.
         * @param {boolean} [stream] Whether to stream events for the fine-tune job. If set to true, events will be sent as data-only [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#Event_stream_format) as they become available. The stream will terminate with a &#x60;data: [DONE]&#x60; message when the job is finished (succeeded, cancelled, or failed).  If set to false, only events generated so far will be returned.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listFineTuneEvents(fineTuneId, stream, options) {
            return localVarFp.listFineTuneEvents(fineTuneId, stream, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary List your organization\'s fine-tuning jobs
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listFineTunes(options) {
            return localVarFp.listFineTunes(options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Lists the currently available models, and provides basic information about each one such as the owner and availability.
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        listModels(options) {
            return localVarFp.listModels(options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Retrieves a model instance, providing basic information about it such as the owner and availability.
         * @param {string} engineId The ID of the engine to use for this request
         * @param {*} [options] Override http request option.
         * @deprecated
         * @throws {RequiredError}
         */
        retrieveEngine(engineId, options) {
            return localVarFp.retrieveEngine(engineId, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Returns information about a specific file.
         * @param {string} fileId The ID of the file to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        retrieveFile(fileId, options) {
            return localVarFp.retrieveFile(fileId, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Gets info about the fine-tune job.  [Learn more about Fine-tuning](/docs/guides/fine-tuning)
         * @param {string} fineTuneId The ID of the fine-tune job
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        retrieveFineTune(fineTuneId, options) {
            return localVarFp.retrieveFineTune(fineTuneId, options).then((request) => request(axios, basePath));
        },
        /**
         *
         * @summary Retrieves a model instance, providing basic information about the model such as the owner and permissioning.
         * @param {string} model The ID of the model to use for this request
         * @param {*} [options] Override http request option.
         * @throws {RequiredError}
         */
        retrieveModel(model, options) {
            return localVarFp.retrieveModel(model, options).then((request) => request(axios, basePath));
        },
    };
};
/**
 * OpenAIApi - object-oriented interface
 * @export
 * @class OpenAIApi
 * @extends {BaseAPI}
 */
class OpenAIApi extends base_1.BaseAPI {
    /**
     *
     * @summary Immediately cancel a fine-tune job.
     * @param {string} fineTuneId The ID of the fine-tune job to cancel
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    cancelFineTune(fineTuneId, options) {
        return exports.OpenAIApiFp(this.configuration).cancelFineTune(fineTuneId, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Answers the specified question using the provided documents and examples.  The endpoint first [searches](/docs/api-reference/searches) over provided documents or files to find relevant context. The relevant context is combined with the provided examples and question to create the prompt for [completion](/docs/api-reference/completions).
     * @param {CreateAnswerRequest} createAnswerRequest
     * @param {*} [options] Override http request option.
     * @deprecated
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createAnswer(createAnswerRequest, options) {
        return exports.OpenAIApiFp(this.configuration).createAnswer(createAnswerRequest, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Creates a completion for the chat message
     * @param {CreateChatCompletionRequest} createChatCompletionRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createChatCompletion(createChatCompletionRequest, options) {
        return exports.OpenAIApiFp(this.configuration).createChatCompletion(createChatCompletionRequest, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Classifies the specified `query` using provided examples.  The endpoint first [searches](/docs/api-reference/searches) over the labeled examples to select the ones most relevant for the particular query. Then, the relevant examples are combined with the query to construct a prompt to produce the final label via the [completions](/docs/api-reference/completions) endpoint.  Labeled examples can be provided via an uploaded `file`, or explicitly listed in the request using the `examples` parameter for quick tests and small scale use cases.
     * @param {CreateClassificationRequest} createClassificationRequest
     * @param {*} [options] Override http request option.
     * @deprecated
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createClassification(createClassificationRequest, options) {
        return exports.OpenAIApiFp(this.configuration).createClassification(createClassificationRequest, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Creates a completion for the provided prompt and parameters
     * @param {CreateCompletionRequest} createCompletionRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createCompletion(createCompletionRequest, options) {
        return exports.OpenAIApiFp(this.configuration).createCompletion(createCompletionRequest, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Creates a new edit for the provided input, instruction, and parameters.
     * @param {CreateEditRequest} createEditRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createEdit(createEditRequest, options) {
        return exports.OpenAIApiFp(this.configuration).createEdit(createEditRequest, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Creates an embedding vector representing the input text.
     * @param {CreateEmbeddingRequest} createEmbeddingRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createEmbedding(createEmbeddingRequest, options) {
        return exports.OpenAIApiFp(this.configuration).createEmbedding(createEmbeddingRequest, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Upload a file that contains document(s) to be used across various endpoints/features. Currently, the size of all the files uploaded by one organization can be up to 1 GB. Please contact us if you need to increase the storage limit.
     * @param {File} file Name of the [JSON Lines](https://jsonlines.readthedocs.io/en/latest/) file to be uploaded.  If the &#x60;purpose&#x60; is set to \\\&quot;fine-tune\\\&quot;, each line is a JSON record with \\\&quot;prompt\\\&quot; and \\\&quot;completion\\\&quot; fields representing your [training examples](/docs/guides/fine-tuning/prepare-training-data).
     * @param {string} purpose The intended purpose of the uploaded documents.  Use \\\&quot;fine-tune\\\&quot; for [Fine-tuning](/docs/api-reference/fine-tunes). This allows us to validate the format of the uploaded file.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createFile(file, purpose, options) {
        return exports.OpenAIApiFp(this.configuration).createFile(file, purpose, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Creates a job that fine-tunes a specified model from a given dataset.  Response includes details of the enqueued job including job status and the name of the fine-tuned models once complete.  [Learn more about Fine-tuning](/docs/guides/fine-tuning)
     * @param {CreateFineTuneRequest} createFineTuneRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createFineTune(createFineTuneRequest, options) {
        return exports.OpenAIApiFp(this.configuration).createFineTune(createFineTuneRequest, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Creates an image given a prompt.
     * @param {CreateImageRequest} createImageRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createImage(createImageRequest, options) {
        return exports.OpenAIApiFp(this.configuration).createImage(createImageRequest, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Creates an edited or extended image given an original image and a prompt.
     * @param {File} image The image to edit. Must be a valid PNG file, less than 4MB, and square. If mask is not provided, image must have transparency, which will be used as the mask.
     * @param {string} prompt A text description of the desired image(s). The maximum length is 1000 characters.
     * @param {File} [mask] An additional image whose fully transparent areas (e.g. where alpha is zero) indicate where &#x60;image&#x60; should be edited. Must be a valid PNG file, less than 4MB, and have the same dimensions as &#x60;image&#x60;.
     * @param {number} [n] The number of images to generate. Must be between 1 and 10.
     * @param {string} [size] The size of the generated images. Must be one of &#x60;256x256&#x60;, &#x60;512x512&#x60;, or &#x60;1024x1024&#x60;.
     * @param {string} [responseFormat] The format in which the generated images are returned. Must be one of &#x60;url&#x60; or &#x60;b64_json&#x60;.
     * @param {string} [user] A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. [Learn more](/docs/guides/safety-best-practices/end-user-ids).
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createImageEdit(image, prompt, mask, n, size, responseFormat, user, options) {
        return exports.OpenAIApiFp(this.configuration).createImageEdit(image, prompt, mask, n, size, responseFormat, user, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Creates a variation of a given image.
     * @param {File} image The image to use as the basis for the variation(s). Must be a valid PNG file, less than 4MB, and square.
     * @param {number} [n] The number of images to generate. Must be between 1 and 10.
     * @param {string} [size] The size of the generated images. Must be one of &#x60;256x256&#x60;, &#x60;512x512&#x60;, or &#x60;1024x1024&#x60;.
     * @param {string} [responseFormat] The format in which the generated images are returned. Must be one of &#x60;url&#x60; or &#x60;b64_json&#x60;.
     * @param {string} [user] A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse. [Learn more](/docs/guides/safety-best-practices/end-user-ids).
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createImageVariation(image, n, size, responseFormat, user, options) {
        return exports.OpenAIApiFp(this.configuration).createImageVariation(image, n, size, responseFormat, user, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Classifies if text violates OpenAI\'s Content Policy
     * @param {CreateModerationRequest} createModerationRequest
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createModeration(createModerationRequest, options) {
        return exports.OpenAIApiFp(this.configuration).createModeration(createModerationRequest, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary The search endpoint computes similarity scores between provided query and documents. Documents can be passed directly to the API if there are no more than 200 of them.  To go beyond the 200 document limit, documents can be processed offline and then used for efficient retrieval at query time. When `file` is set, the search endpoint searches over all the documents in the given file and returns up to the `max_rerank` number of documents. These documents will be returned along with their search scores.  The similarity score is a positive score that usually ranges from 0 to 300 (but can sometimes go higher), where a score above 200 usually means the document is semantically similar to the query.
     * @param {string} engineId The ID of the engine to use for this request.  You can select one of &#x60;ada&#x60;, &#x60;babbage&#x60;, &#x60;curie&#x60;, or &#x60;davinci&#x60;.
     * @param {CreateSearchRequest} createSearchRequest
     * @param {*} [options] Override http request option.
     * @deprecated
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createSearch(engineId, createSearchRequest, options) {
        return exports.OpenAIApiFp(this.configuration).createSearch(engineId, createSearchRequest, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Transcribes audio into the input language.
     * @param {File} file The audio file to transcribe, in one of these formats: mp3, mp4, mpeg, mpga, m4a, wav, or webm.
     * @param {string} model ID of the model to use. Only &#x60;whisper-1&#x60; is currently available.
     * @param {string} [prompt] An optional text to guide the model\\\&#39;s style or continue a previous audio segment. The [prompt](/docs/guides/speech-to-text/prompting) should match the audio language.
     * @param {string} [responseFormat] The format of the transcript output, in one of these options: json, text, srt, verbose_json, or vtt.
     * @param {number} [temperature] The sampling temperature, between 0 and 1. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. If set to 0, the model will use [log probability](https://en.wikipedia.org/wiki/Log_probability) to automatically increase the temperature until certain thresholds are hit.
     * @param {string} [language] The language of the input audio. Supplying the input language in [ISO-639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) format will improve accuracy and latency.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createTranscription(file, model, prompt, responseFormat, temperature, language, options) {
        return exports.OpenAIApiFp(this.configuration).createTranscription(file, model, prompt, responseFormat, temperature, language, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Translates audio into into English.
     * @param {File} file The audio file to translate, in one of these formats: mp3, mp4, mpeg, mpga, m4a, wav, or webm.
     * @param {string} model ID of the model to use. Only &#x60;whisper-1&#x60; is currently available.
     * @param {string} [prompt] An optional text to guide the model\\\&#39;s style or continue a previous audio segment. The [prompt](/docs/guides/speech-to-text/prompting) should be in English.
     * @param {string} [responseFormat] The format of the transcript output, in one of these options: json, text, srt, verbose_json, or vtt.
     * @param {number} [temperature] The sampling temperature, between 0 and 1. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. If set to 0, the model will use [log probability](https://en.wikipedia.org/wiki/Log_probability) to automatically increase the temperature until certain thresholds are hit.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    createTranslation(file, model, prompt, responseFormat, temperature, options) {
        return exports.OpenAIApiFp(this.configuration).createTranslation(file, model, prompt, responseFormat, temperature, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Delete a file.
     * @param {string} fileId The ID of the file to use for this request
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    deleteFile(fileId, options) {
        return exports.OpenAIApiFp(this.configuration).deleteFile(fileId, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Delete a fine-tuned model. You must have the Owner role in your organization.
     * @param {string} model The model to delete
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    deleteModel(model, options) {
        return exports.OpenAIApiFp(this.configuration).deleteModel(model, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns the contents of the specified file
     * @param {string} fileId The ID of the file to use for this request
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    downloadFile(fileId, options) {
        return exports.OpenAIApiFp(this.configuration).downloadFile(fileId, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Lists the currently available (non-finetuned) models, and provides basic information about each one such as the owner and availability.
     * @param {*} [options] Override http request option.
     * @deprecated
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    listEngines(options) {
        return exports.OpenAIApiFp(this.configuration).listEngines(options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns a list of files that belong to the user\'s organization.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    listFiles(options) {
        return exports.OpenAIApiFp(this.configuration).listFiles(options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Get fine-grained status updates for a fine-tune job.
     * @param {string} fineTuneId The ID of the fine-tune job to get events for.
     * @param {boolean} [stream] Whether to stream events for the fine-tune job. If set to true, events will be sent as data-only [server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#Event_stream_format) as they become available. The stream will terminate with a &#x60;data: [DONE]&#x60; message when the job is finished (succeeded, cancelled, or failed).  If set to false, only events generated so far will be returned.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    listFineTuneEvents(fineTuneId, stream, options) {
        return exports.OpenAIApiFp(this.configuration).listFineTuneEvents(fineTuneId, stream, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary List your organization\'s fine-tuning jobs
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    listFineTunes(options) {
        return exports.OpenAIApiFp(this.configuration).listFineTunes(options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Lists the currently available models, and provides basic information about each one such as the owner and availability.
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    listModels(options) {
        return exports.OpenAIApiFp(this.configuration).listModels(options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Retrieves a model instance, providing basic information about it such as the owner and availability.
     * @param {string} engineId The ID of the engine to use for this request
     * @param {*} [options] Override http request option.
     * @deprecated
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    retrieveEngine(engineId, options) {
        return exports.OpenAIApiFp(this.configuration).retrieveEngine(engineId, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Returns information about a specific file.
     * @param {string} fileId The ID of the file to use for this request
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    retrieveFile(fileId, options) {
        return exports.OpenAIApiFp(this.configuration).retrieveFile(fileId, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Gets info about the fine-tune job.  [Learn more about Fine-tuning](/docs/guides/fine-tuning)
     * @param {string} fineTuneId The ID of the fine-tune job
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    retrieveFineTune(fineTuneId, options) {
        return exports.OpenAIApiFp(this.configuration).retrieveFineTune(fineTuneId, options).then((request) => request(this.axios, this.basePath));
    }
    /**
     *
     * @summary Retrieves a model instance, providing basic information about the model such as the owner and permissioning.
     * @param {string} model The ID of the model to use for this request
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     * @memberof OpenAIApi
     */
    retrieveModel(model, options) {
        return exports.OpenAIApiFp(this.configuration).retrieveModel(model, options).then((request) => request(this.axios, this.basePath));
    }
}
exports.OpenAIApi = OpenAIApi;

},{"./base":42,"./common":43,"axios":4}],42:[function(require,module,exports){
"use strict";
/* tslint:disable */
/* eslint-disable */
/**
 * OpenAI API
 * APIs for sampling from and fine-tuning language models
 *
 * The version of the OpenAPI document: 1.2.0
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequiredError = exports.BaseAPI = exports.COLLECTION_FORMATS = exports.BASE_PATH = void 0;
const axios_1 = require("axios");
exports.BASE_PATH = "https://api.openai.com/v1".replace(/\/+$/, "");
/**
 *
 * @export
 */
exports.COLLECTION_FORMATS = {
    csv: ",",
    ssv: " ",
    tsv: "\t",
    pipes: "|",
};
/**
 *
 * @export
 * @class BaseAPI
 */
class BaseAPI {
    constructor(configuration, basePath = exports.BASE_PATH, axios = axios_1.default) {
        this.basePath = basePath;
        this.axios = axios;
        if (configuration) {
            this.configuration = configuration;
            this.basePath = configuration.basePath || this.basePath;
        }
    }
}
exports.BaseAPI = BaseAPI;
;
/**
 *
 * @export
 * @class RequiredError
 * @extends {Error}
 */
class RequiredError extends Error {
    constructor(field, msg) {
        super(msg);
        this.field = field;
        this.name = "RequiredError";
    }
}
exports.RequiredError = RequiredError;

},{"axios":4}],43:[function(require,module,exports){
"use strict";
/* tslint:disable */
/* eslint-disable */
/**
 * OpenAI API
 * APIs for sampling from and fine-tuning language models
 *
 * The version of the OpenAPI document: 1.2.0
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRequestFunction = exports.toPathString = exports.serializeDataIfNeeded = exports.setSearchParams = exports.setOAuthToObject = exports.setBearerAuthToObject = exports.setBasicAuthToObject = exports.setApiKeyToObject = exports.assertParamExists = exports.DUMMY_BASE_URL = void 0;
const base_1 = require("./base");
/**
 *
 * @export
 */
exports.DUMMY_BASE_URL = 'https://example.com';
/**
 *
 * @throws {RequiredError}
 * @export
 */
exports.assertParamExists = function (functionName, paramName, paramValue) {
    if (paramValue === null || paramValue === undefined) {
        throw new base_1.RequiredError(paramName, `Required parameter ${paramName} was null or undefined when calling ${functionName}.`);
    }
};
/**
 *
 * @export
 */
exports.setApiKeyToObject = function (object, keyParamName, configuration) {
    return __awaiter(this, void 0, void 0, function* () {
        if (configuration && configuration.apiKey) {
            const localVarApiKeyValue = typeof configuration.apiKey === 'function'
                ? yield configuration.apiKey(keyParamName)
                : yield configuration.apiKey;
            object[keyParamName] = localVarApiKeyValue;
        }
    });
};
/**
 *
 * @export
 */
exports.setBasicAuthToObject = function (object, configuration) {
    if (configuration && (configuration.username || configuration.password)) {
        object["auth"] = { username: configuration.username, password: configuration.password };
    }
};
/**
 *
 * @export
 */
exports.setBearerAuthToObject = function (object, configuration) {
    return __awaiter(this, void 0, void 0, function* () {
        if (configuration && configuration.accessToken) {
            const accessToken = typeof configuration.accessToken === 'function'
                ? yield configuration.accessToken()
                : yield configuration.accessToken;
            object["Authorization"] = "Bearer " + accessToken;
        }
    });
};
/**
 *
 * @export
 */
exports.setOAuthToObject = function (object, name, scopes, configuration) {
    return __awaiter(this, void 0, void 0, function* () {
        if (configuration && configuration.accessToken) {
            const localVarAccessTokenValue = typeof configuration.accessToken === 'function'
                ? yield configuration.accessToken(name, scopes)
                : yield configuration.accessToken;
            object["Authorization"] = "Bearer " + localVarAccessTokenValue;
        }
    });
};
function setFlattenedQueryParams(urlSearchParams, parameter, key = "") {
    if (parameter == null)
        return;
    if (typeof parameter === "object") {
        if (Array.isArray(parameter)) {
            parameter.forEach(item => setFlattenedQueryParams(urlSearchParams, item, key));
        }
        else {
            Object.keys(parameter).forEach(currentKey => setFlattenedQueryParams(urlSearchParams, parameter[currentKey], `${key}${key !== '' ? '.' : ''}${currentKey}`));
        }
    }
    else {
        if (urlSearchParams.has(key)) {
            urlSearchParams.append(key, parameter);
        }
        else {
            urlSearchParams.set(key, parameter);
        }
    }
}
/**
 *
 * @export
 */
exports.setSearchParams = function (url, ...objects) {
    const searchParams = new URLSearchParams(url.search);
    setFlattenedQueryParams(searchParams, objects);
    url.search = searchParams.toString();
};
/**
 *
 * @export
 */
exports.serializeDataIfNeeded = function (value, requestOptions, configuration) {
    const nonString = typeof value !== 'string';
    const needsSerialization = nonString && configuration && configuration.isJsonMime
        ? configuration.isJsonMime(requestOptions.headers['Content-Type'])
        : nonString;
    return needsSerialization
        ? JSON.stringify(value !== undefined ? value : {})
        : (value || "");
};
/**
 *
 * @export
 */
exports.toPathString = function (url) {
    return url.pathname + url.search + url.hash;
};
/**
 *
 * @export
 */
exports.createRequestFunction = function (axiosArgs, globalAxios, BASE_PATH, configuration) {
    return (axios = globalAxios, basePath = BASE_PATH) => {
        const axiosRequestArgs = Object.assign(Object.assign({}, axiosArgs.options), { url: ((configuration === null || configuration === void 0 ? void 0 : configuration.basePath) || basePath) + axiosArgs.url });
        return axios.request(axiosRequestArgs);
    };
};

},{"./base":42}],44:[function(require,module,exports){
"use strict";
/* tslint:disable */
/* eslint-disable */
/**
 * OpenAI API
 * APIs for sampling from and fine-tuning language models
 *
 * The version of the OpenAPI document: 1.2.0
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Configuration = void 0;
const packageJson = require("../package.json");
class Configuration {
    constructor(param = {}) {
        this.apiKey = param.apiKey;
        this.organization = param.organization;
        this.username = param.username;
        this.password = param.password;
        this.accessToken = param.accessToken;
        this.basePath = param.basePath;
        this.baseOptions = param.baseOptions;
        this.formDataCtor = param.formDataCtor;
        if (!this.baseOptions) {
            this.baseOptions = {};
        }
        this.baseOptions.headers = Object.assign({ 'User-Agent': `OpenAI/NodeJS/${packageJson.version}`, 'Authorization': `Bearer ${this.apiKey}` }, this.baseOptions.headers);
        if (this.organization) {
            this.baseOptions.headers['OpenAI-Organization'] = this.organization;
        }
        if (!this.formDataCtor) {
            this.formDataCtor = require("form-data");
        }
    }
    /**
     * Check if the given MIME is a JSON MIME.
     * JSON MIME examples:
     *   application/json
     *   application/json; charset=UTF8
     *   APPLICATION/JSON
     *   application/vnd.company+json
     * @param mime - MIME (Multipurpose Internet Mail Extensions)
     * @return True if the given MIME is JSON, false otherwise.
     */
    isJsonMime(mime) {
        const jsonMime = new RegExp('^(application\/json|[^;/ \t]+\/[^;/ \t]+[+]json)[ \t]*(;.*)?$', 'i');
        return mime !== null && (jsonMime.test(mime) || mime.toLowerCase() === 'application/json-patch+json');
    }
}
exports.Configuration = Configuration;

},{"../package.json":46,"form-data":34}],45:[function(require,module,exports){
"use strict";
/* tslint:disable */
/* eslint-disable */
/**
 * OpenAI API
 * APIs for sampling from and fine-tuning language models
 *
 * The version of the OpenAPI document: 1.2.0
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./api"), exports);
__exportStar(require("./configuration"), exports);

},{"./api":41,"./configuration":44}],46:[function(require,module,exports){
module.exports={
  "name": "openai",
  "version": "3.2.1",
  "description": "Node.js library for the OpenAI API",
  "repository": {
    "type": "git",
    "url": "git@github.com:openai/openai-node.git"
  },
  "keywords": [
    "openai",
    "open",
    "ai",
    "gpt-3",
    "gpt3"
  ],
  "author": "OpenAI",
  "license": "MIT",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc --outDir dist/"
  },
  "dependencies": {
    "axios": "^0.26.0",
    "form-data": "^4.0.0"
  },
  "devDependencies": {
    "@types/node": "^12.11.5",
    "typescript": "^3.6.4"
  }
}

},{}]},{},[3]);
