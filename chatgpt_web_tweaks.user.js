// ==UserScript==
// @name         ChatGPT tweaks
// @description  Various tweaks for ChatGPT
// @author       toast_riot
// @namespace    https://github.com/toast-riot/chatgpt-web-tweaks
// @version      0.0.1
// @match        *://chatgpt.com/*
// @run-at       document-start
// @grant        unsafeWindow
// ==/UserScript==

(function () {
'use strict';

//===   CONFIG   ===//
const config = {
    //- Global settings
    global: {
        logging: true
    },

    //- Use a custom tab title and icon
    customTab: {
        enabled: false,
        title: 'New Tab',
        icon: 'data:image/png;base64,'
    },

    //- Block tracking requests
    preventTracking: {
        enabled: true,
        // Regex to match tracking URLs
        trackingURLs: /gravatar\.com|browser-intake-datadoghq\.com|\.wp\.com|intercomcdn\.com|sentry\.io|sentry_key=|intercom\.io|featuregates\.org|\/v1\/initialize|\/messenger\/|statsigapi\.net|\/rgstr|\/v1\/sdk_exception|chatgpt\.com\/ces/,
    },

    //- Save model quota by defaulting to a different model
    // Might not work for paid users
    quotaSaving: {
        enabled: false,
        // Key to hold to temporarily disable quota saving
        overrideKey: 'Control',
        // Model to use when saving quota
        // I think OpenAI has implemented a check for whether the model is valid so any other models other than the ones in the GUI will just redirect to 3.5
        // Use "text-davinci-002-render-sha" for GPT-3.5
        savingModel: "gpt-4o-mini",
        // Always override these models. Leave this as "auto" unless you know what you're doing
        avoidModels: ["auto"]
    },

    //- Add more models. By default, this will just add GPT-3.5 back
    // If you want to add more models, check out tests/customModels.js in the repo. It has info you can use to work it out yourself
    // Putting in a random model slug returns very different responses to text-davinci-002-render-sha, so I know there's at least one other model that works
    moreModels: {
        enabled: true,
        categories: [
            // GPT-3.5
            {"category": "gpt_3.5","human_category_name": "GPT-3.5","human_category_short_name": "3.5","color": "#000000","icon": "","subscription_level": "free","default_model": "text-davinci-002-render-sha","short_explainer": "GPT-3.5 returned","tagline": "GPT-3.5 returned"}
        ],
        models: []
    },

    //- Element blocker
    elementBlocker: {
        enabled: true,
        // Outline blocked elements instead of hiding them
        debug: false,
        // CSS selectors of elements to block. Make sure to escape backslashes
        blockElements: {
            //- Misc
            //ChatGPT can make mistakes
            '.md\\:px-\\[60px\\].text-token-text-secondary.text-xs.text-center.py-2.px-2.relative > span': true,
            //Chat suggestions
            '.gap-4.justify-center.items-stretch.flex-wrap.max-w-3xl.flex.mt-12.mx-3': true,
            '.z-20.right-0.left-0.bottom-full.absolute': true,
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
        }
    },

    //- Fix compliance issues
    // Only use if you need to
    complianceFix: {
        enabled: false,
        // Response to return when checking if compliance is required
        response: {"registration_country":null,"require_cookie_consent":false,"terms_of_use":{"is_required":false,"display":null},"cookie_consent":null,"age_verification":null}
    },

    //- Custom CSS
    customCSS: {
        enabled: false,
        CSS: ``
    }

}
//=== END CONFIG ===//



//=== SCRIPT ===//

let overrideKeyDown = false;

const utils = {
    log: function(...args) {
        if (!config.global.logging) { return }
        console.log('[ChatGPT Tweaks]', ...args);
    },
    updateModelParameter: function(sourceRequest) {
        if (overrideKeyDown) { return sourceRequest }
        const requestData = JSON.parse(sourceRequest.body);

        if (config.quotaSaving.avoidModels.includes(requestData.model)) {
            requestData.model = config.quotaSaving.savingModel;
            utils.log('(QuotaSaving) Overriding model');
        }

        return { ...sourceRequest, body: JSON.stringify(requestData) };
    }
}

const setup = {
    controlKeyListener: function controlKeyListener() {
        addEventListener('keydown', function(event) {
            if (event.key === config.quotaSaving.overrideKey) overrideKeyDown = true;
        });
        addEventListener('keyup', function(event) {
            if (event.key === config.quotaSaving.overrideKey) overrideKeyDown = false;
        });
    },

    proxyFetch: function() {
        if (config.preventTracking.enabled) navigator.sendBeacon = () => {};
        unsafeWindow.fetch = new Proxy(fetch, {
            apply: async function (target, thisArg, reqArgs) {
                const [url, options] = reqArgs;

                if (config.preventTracking.enabled && config.preventTracking.trackingURLs.test(url)) {
                    utils.log('(Prevent Tracking) Blocked tracking request: ', url);
                    return Promise.resolve({});
                }

                if (config.preventTracking.enabled && url.includes('/backend-api/compliance')) {
                    return Promise.resolve({ json: () => config.complianceFix.response });
                }

                if (config.quotaSaving.enabled && url.includes('/backend-api/conversation') && options.method === "POST" && options.body.includes('"action":"')) {
                    reqArgs[1] = utils.updateModelParameter(reqArgs[1]);
                }

                if (config.moreModels.enabled && url.includes('/backend-api/models') && options.method === "GET") {
                    const realResponse = await target.apply(thisArg, reqArgs);
                    const data = await realResponse.json();

                    data.categories.push(...config.moreModels.categories);
                    data.models.push(...config.moreModels.models);

                    return new Response(JSON.stringify(data), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }

                return await target.apply(thisArg, reqArgs)
                    .catch(console.error);
            }
        });
    },

    customTab: function() {
        if (!config.customTab.enabled) return;

        document.querySelectorAll('head link[rel="icon"]').forEach(node => {
            node.href = config.customTab.icon;
        });

        document.title = config.customTab.title;

        const originalTitle = document.title;
        Object.defineProperty(document, 'title', {
            get: function() {
                return originalTitle;
            },
            set: function(title) {}
        });
    },

    customCSS: function() {
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
};

function main() {
    Object.values(setup).forEach(func => func());
    utils.log('Loaded');
};

main();

})();
