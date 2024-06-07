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
const config = {
    //- Use a custom tab title and icon
    customTab: {
        enabled: true,
        title: 'New Tab',
        icon: 'data:image/png;base64,'
    },


    //- Block tracking requests
    preventTracking: {
        enabled: true,
        // Regex to match tracking URLs
        trackingURLs: /gravatar\.com|browser-intake-datadoghq\.com|\.wp\.com|intercomcdn\.com|sentry\.io|sentry_key=|intercom\.io|featuregates\.org|\/v1\/initialize|\/messenger\/|statsigapi\.net|\/rgstr|\/v1\/sdk_exception/,
    },


    //- Save quota by defaulting to another model
    // Will default to GPT-3.5 if the control key is not pressed
    quotaSaving: {
        enabled: true,
        // Override the model even if the message is a variant
        harshFiltering: true,
        // Model to use when saving quota. This is the only one that will work, for free users
        // I think OpenAI has implemented a check for whether the model is valid so any other models other than the ones in the GUI will just redirect to 3.5
        model: "text-davinci-002-render-sha",
    },

    //- Fix compliance issues
    // Only use if you need to
    complianceFix: {
        enabled: false,
        response: {"registration_country":null,"require_cookie_consent":false,"terms_of_use":{"is_required":false,"display":null},"cookie_consent":null,"age_verification":null}
    },

    //- Element blocker
    elementBlocker: {
        enabled: true,
        // Outline blocked elements instead of hiding them
        debug: false,
        blockElements: {
            //- Misc
            //ChatGPT can make mistakes
            '.md\\:px-\\[60px\\].text-token-text-secondary.text-xs.text-center.py-2.px-2.relative > span': true,
            //Chat suggestions
            '.gap-4.justify-center.items-stretch.flex-wrap.max-w-3xl.flex.mt-12.mx-3': true,
            //GPT pfp
            '.items-end.relative.flex-col.flex.flex-shrink-0': true,

            //- No premium
            //Upgrade plan sidebar item
            '.dark\\:border-white\\/20.juice\\:py-2.empty\\:hidden.pt-2.flex-col.flex': true,

            //- Feedback
            //Bad response button
            '.flex.p-1.rounded-xl.justify-start.items-center > .items-center.flex > .flex > span > .hover\\:bg-token-main-surface-secondary.text-token-text-secondary.rounded-lg > .justify-center.items-center.w-\\[30px\\].h-\\[30px\\].flex': true,
            //Is this conversation helpful so far
            '.empty\\:hidden.w-full.mt-3': true
        },
    },

    //- Custom CSS
    customCSS: {
        enabled: false,
        CSS: ``
    }

}
//=== END CONFIG ===//



//=== SCRIPT ===//

let controlKeyIsDown = false;
function controlKeyListener() {
    addEventListener('keydown', function(event) {
        if (event.key === "Control") controlKeyIsDown = true;
    });
    addEventListener('keyup', function(event) {
        if (event.key === "Control") controlKeyIsDown = false;
    });
}


function updateModelParameter(sourceRequest) {
    const requestData = JSON.parse(sourceRequest.body);

    if (requestData.action === "variant") {
        if (config.quotaSaving.harshFiltering && !controlKeyIsDown) {
            requestData.model = config.quotaSaving.model;
        }
    }
    else if (!controlKeyIsDown) {
        requestData.model = config.quotaSaving.model;
    }

    // requestData.model = prompt("Model", requestData.model);
    // console.log(requestData);

    alert("Model: " + requestData.model);
    // requestData.model = config.quotaSaving.model;
    return 'test';

    return { ...sourceRequest, body: JSON.stringify(requestData) };
}


function proxyFetch() {
    if (config.preventTracking.enabled) navigator.sendBeacon = () => {};
    unsafeWindow.fetch = new Proxy(fetch, {
        apply: function (target, thisArg, argumentsList) {
            const [fetchUrl, fetchOptions] = argumentsList;
            if (config.preventTracking.enabled && config.preventTracking.trackingURLs.test(fetchUrl)) {
                return Promise.resolve({});
            }
            if (config.preventTracking.enabled && fetchUrl.includes('/backend-api/compliance')) {
                return Promise.resolve({ json: () => config.complianceFix.response });
            }
            if (config.quotaSaving.enabled && fetchUrl.includes('/backend-api/conversation') && fetchOptions.method === "POST" && fetchOptions.body) {
                argumentsList[1] = updateModelParameter(fetchOptions);
                if (argumentsList[1] = 'test') { return; }
            }
            return target.apply(thisArg, argumentsList)
                .catch(console.error);
        }
    })
}

function customTab() {
    if (!config.customTab.enabled) return;
    const headObserver = new MutationObserver(() => {
        document.title = config.customTab.title;
        document.querySelectorAll('head link[rel="icon"]').forEach(node => {
            node.href = config.customTab.icon;
        });
    });

    headObserver.observe(document.querySelector('head'), {childList: true});
    document.title = config.customTab.title;
}

function customCSS() {
    let css = '';

    if (config.customCSS.enabled) {
        css += config.customCSS.CSS;
    }

    if (config.elementBlocker.enabled) {
        Object.entries(config.elementBlocker.blockElements).forEach(([selector, block]) => {
            if (!block) return;
            css += `${selector} {\n\t${config.elementBlocker.debug ? 'outline: 1px solid red !important' : 'display: none !important'};\n}\n`;
        });
    }

    if (!css) return;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
}


(function main() {
    controlKeyListener();
    proxyFetch();
    customTab();
    customCSS();
})();

})();
