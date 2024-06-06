// ==UserScript==
// @name         ChatGPT tweaks
// @version      0.0.1
// @description  Various tweaks for ChatGPT
// @match        *://chatgpt.com/*
// @run-at       document-start
// @grant        unsafeWindow
// ==/UserScript==

(function () {
'use strict';

//===   CONFIG   ===//
//- Use a custom tab title and icon
// Blank string to disable
const tabTitle = 'New Tab';

//- Block tracking requests
const preventTracking = true;
// Regex to match tracking URLs
const trackingURLs = /gravatar\.com|browser-intake-datadoghq\.com|\.wp\.com|intercomcdn\.com|sentry\.io|sentry_key=|intercom\.io|featuregates\.org|\/v1\/initialize|\/messenger\/|statsigapi\.net|\/rgstr|\/v1\/sdk_exception/;

//- Save quota by defaulting to another model
// Will default to GPT-3.5 if the control key is not pressed
const saveQuota = true;
// Override the model even if the message is a variant
const saveQuotaHarsh = true;
// Model to use when saving quota. This is the only one that will work, for free users
// While you can change it, the response you get will still be from this model
const saveQuotaModel = "text-davinci-002-render-sha";

//- Fix compliance issues
// Only use if you need to
const preventCompliance = false;

///=== END CONFIG ===///



//=== SCRIPT ===//
const compliance_response = {"registration_country":null,"require_cookie_consent":false,"terms_of_use":{"is_required":false,"display":null},"cookie_consent":null,"age_verification":null};


//- Quota saving
let controlKeyIsDown = false;
addEventListener('keydown', function(event) {
    if (event.key === "Control") controlKeyIsDown = true;
});
addEventListener('keyup', function(event) {
    if (event.key === "Control") controlKeyIsDown = false;
});


function updateModelParameter(sourceRequest) {
    const requestData = JSON.parse(sourceRequest.body);

    if (requestData.action === "variant") {
        if (saveQuotaHarsh && !controlKeyIsDown) {
            requestData.model = saveQuotaModel;
        }
    }
    else if (!controlKeyIsDown) {
        requestData.model = saveQuotaModel;
    }

    // requestData.model = prompt("Model", requestData.model);
    // console.log(requestData);

    // alert("Model: " + requestData.model);
    // requestData.model = saveQuotaModel;

    return { ...sourceRequest, body: JSON.stringify(requestData) };
}


//- Main
if (preventTracking) navigator.sendBeacon = () => {};
unsafeWindow.fetch = new Proxy(fetch, {
    apply: function (target, thisArg, argumentsList) {
        const [fetchUrl, fetchOptions] = argumentsList;
        if (preventTracking && trackingURLs.test(fetchUrl)) {
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


//- Custom tab
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


//- Custom CSS
const style = document.createElement('style');
style.textContent = `
:root {
    /*=== DEBUGGING CONFIG ===*/
    --debug:;
    --debug_outline: 1px solid red;
    /*========================*/

    --display: var(--debug, none)
}

/*- Misc */

/*ChatGPT can make mistakes removed */
.md\:px-\[60px\].text-token-text-secondary.text-xs.text-center.py-2.px-2.relative > span {
    outline: 1px solid red !important;
    display: none;
}

/* No time sorting */
/* .juice\:bg-token-sidebar-surface-primary.juice\:z-20.juice\:top-0.juice\:sticky > .items-center.h-9.flex {
    outline: 1px solid red !important;
} */


/* Chat suggestions */
.gap-4.justify-center.items-stretch.flex-wrap.max-w-3xl.flex.mt-12.mx-3 {
    outline: var(--debug_outline) !important;
    display: var(--display)
}

/*- No premuim */
/* Upgrade plan sidebar item */
.dark\:border-white\/20.juice\:py-2.empty\:hidden.pt-2.flex-col.flex {
    outline: var(--debug_outline) !important;
    display: var(--display)
}


/*- Dissociate */
/* GPT pfp */
.items-end.relative.flex-col.flex.flex-shrink-0 {
    outline: var(--debug_outline) !important;
    display: var(--display)
}


/*- Feedback */
/* Bad response button */
.flex.p-1.rounded-xl.justify-start.items-center > .items-center.flex > .flex > span > .hover\:bg-token-main-surface-secondary.text-token-text-secondary.rounded-lg > .justify-center.items-center.w-\[30px\].h-\[30px\].flex {
    outline: var(--debug_outline) !important;
    display: var(--display)
}
/* Is this conversation helpful so far */
/* .pb-9.text-sm.flex-col.flex > .mx-auto > div  { */
.empty\:hidden.w-full.mt-3 {
    outline: var(--debug_outline) !important;
    display: var(--display)
}
/* .text-sm.text-token-text-secondary.bg-token-main-surface-secondary.rounded-md.p-4.items-center.justify-between.flex {
    outline: var(--debug_outline) !important;
    display: var(--display)
} */
/* .text-sm.flex-col.flex > .mx-auto {
    outline: var(--debug_outline) !important;
    display: var(--display)
} */
`;
document.head.appendChild(style);

})();
