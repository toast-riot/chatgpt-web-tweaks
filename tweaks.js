// ==UserScript==
// @name         ChatGPT tweaks
// @version      0.0.1
// @description  Blocks tracking requests from ChatGPT, change tab title and icon, fix compliance issues
// @match        *://chatgpt.com/*
// @run-at       document-start
// @grant        unsafeWindow
// ==/UserScript==

(function () {
'use strict';

//=== CONFIG ===//
const tabTitle = 'New Tab'; //Set to empty string to disable
const filteredURLs = /gravatar\.com|browser-intake-datadoghq\.com|\.wp\.com|intercomcdn\.com|sentry\.io|sentry_key=|intercom\.io|featuregates\.org|\/v1\/initialize|\/messenger\/|statsigapi\.net|\/rgstr|\/v1\/sdk_exception/;
const preventTracking = true;
const preventCompliance = false;
const saveQuota = true;


//=== QUOTA SAVER ===//
let controlKeyIsDown = false;
addEventListener('keydown', function(event) {
    if (event.key === "Control") controlKeyIsDown = true;
});
addEventListener('keyup', function(event) {
    if (event.key === "Control") controlKeyIsDown = false;
});


function updateModelParameter(sourceRequest) {
    const requestData = JSON.parse(sourceRequest.body);

    if (!controlKeyIsDown) requestData.model = "text-davinci-002-render-sha";

    // requestData.model = prompt("Model", requestData.model);
    // console.log(requestData);

    return { ...sourceRequest, body: JSON.stringify(requestData) };
}


//=== MAIN ===//
const compliance_response = {"registration_country":null,"require_cookie_consent":false,"terms_of_use":{"is_required":false,"display":null},"cookie_consent":null,"age_verification":null};

if (preventTracking) navigator.sendBeacon = () => {};
unsafeWindow.fetch = new Proxy(fetch, {
    apply: function (target, thisArg, argumentsList) {
        const [fetchUrl, fetchOptions] = argumentsList;
        if (preventTracking && filteredURLs.test(fetchUrl)) {
            return Promise.resolve({});
        }
        if (preventCompliance && fetchUrl.includes('/backend-api/compliance')) {
            return Promise.resolve({ json: () => compliance_response });
        }
        if (saveQuota && fetchUrl.includes('/backend-api/conversation') && fetchOptions.method === "POST" && fetchOptions.body) {
            argumentsList[1] = updateModelParameter(fetchOptions);
        }
        return target.apply(thisArg, argumentsList)
            .catch(console.error);
    }
});


//=== CUSTOM TAB ===//
const headObserver = new MutationObserver(() => {
    document.title = tabTitle;
    document.querySelectorAll('head link[rel="icon"]').forEach(node => {
        node.href = 'data:image/png;base64,';
    });
});

if (tabTitle != '') {
    headObserver.observe(document.querySelector('head'), {childList: true});
    document.title = tabTitle;
}

})();
