/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*-
 * vim:set ts=2 sw=2 sts=2 et filetype=javascript
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const { Cc, Ci, Cr } = require("chrome");
const apiUtils = require("api-utils/api-utils");
const errors = require("api-utils/errors");

try {
  let alertServ = Cc["@mozilla.org/alerts-service;1"].
                  getService(Ci.nsIAlertsService);

  // The unit test sets this to a mock notification function.
  var notify = alertServ.showAlertNotification.bind(alertServ);
}
catch (err) {
  // An exception will be thrown if the platform doesn't provide an alert
  // service, e.g., if Growl is not installed on OS X.  In that case, use a
  // mock notification function that just logs to the console.
  notify = notifyUsingConsole;
}

exports.notify = function notifications_notify(options) {
  let valOpts = validateOptions(options);
  let clickObserver = !valOpts.onClick ? null : {
    observe: function notificationClickObserved(subject, topic, data) {
      if (topic === "alertclickcallback")
        errors.catchAndLog(valOpts.onClick).call(exports, valOpts.data);
    }
  };
  function notifyWithOpts(notifyFn) {
    notifyFn(valOpts.iconURL, valOpts.title, valOpts.text, !!clickObserver,
             valOpts.data, clickObserver);
  }
  try {
    notifyWithOpts(notify);
  }
  catch (err if err instanceof Ci.nsIException &&
                err.result == Cr.NS_ERROR_FILE_NOT_FOUND) {
    console.warn("The notification icon named by " + valOpts.iconURL +
                 " does not exist.  A default icon will be used instead.");
    delete valOpts.iconURL;
    notifyWithOpts(notify);
  }
  catch (err) {
    notifyWithOpts(notifyUsingConsole);
  }
};

function notifyUsingConsole(iconURL, title, text) {
  title = title ? "[" + title + "]" : "";
  text = text || "";
  let str = [title, text].filter(function (s) s).join(" ");
  console.log(str);
}

function validateOptions(options) {
  return apiUtils.validateOptions(options, {
    data: {
      is: ["string", "undefined"]
    },
    iconURL: {
      is: ["string", "undefined"]
    },
    onClick: {
      is: ["function", "undefined"]
    },
    text: {
      is: ["string", "undefined"]
    },
    title: {
      is: ["string", "undefined"]
    }
  });
}
