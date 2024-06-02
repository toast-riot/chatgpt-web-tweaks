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
const tabTitle = 'New Tab';
const block_url = /gravatar\.com|browser-intake-datadoghq\.com|\.wp\.com|intercomcdn\.com|sentry\.io|sentry_key=|intercom\.io|featuregates\.org|\/v1\/initialize|\/messenger\/|statsigapi\.net|\/rgstr|\/v1\/sdk_exception/;


//=== SCRIPT ===//
const compliance_response = {"registration_country":null,"require_cookie_consent":false,"terms_of_use":{"is_required":false,"display":null},"cookie_consent":null,"age_verification":null};

navigator.sendBeacon = () => {};
unsafeWindow.fetch = new Proxy(fetch, {
    apply: function (target, thisArg, argumentsList) {
        const fetchUrl = argumentsList[0];
        if (block_url.test(fetchUrl)) {
            console.log('Blocked:', fetchUrl);
            return Promise.resolve({});
        }
        // if (fetchUrl.includes('/backend-api/compliance')) {
        //     return Promise.resolve({ json: () => compliance_response });
        // }
        return target.apply(thisArg, argumentsList)
            .catch(console.error);
    }
});


const headObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (document.title !== tabTitle) {
            document.title = tabTitle;
        }
        for (const node of document.querySelectorAll('head link[rel="icon"]')) {
            node.href = 'data:image/png;base64,'
        }
    });
});


if (tabTitle != '') {
    headObserver.observe(document.querySelector('head'), {childList: true});
    document.title = tabTitle;
}

})();