// ==UserScript==
// @name         addBack
// @match        *://chatgpt.com/*
// @run-at       document-start
// @grant        unsafeWindow
// ==/UserScript==

(function () {
"use strict";

const customCategory = {"category": "custom","human_category_name": "GPT-3.5","human_category_short_name": "3.5","color": "#000000","icon": "","subscription_level": "free","default_model": "text-davinci-002-render-sha","short_explainer": "GPT-3.5 returned","tagline": "GPT-3.5 returned"}

unsafeWindow.fetch = new Proxy(fetch, {
    apply: function (target, thisArg, argumentsList) {
        const [fetchUrl, fetchOptions] = argumentsList;



        if (fetchUrl.includes('/backend-api/models')) {
            return new Promise((resolve, reject) => {

                const realResponse = target.apply(thisArg, argumentsList);
                realResponse.then(async response => {

                    let data = await response.json();

                    data.categories.push(customCategory)

                    resolve(new Response(JSON.stringify(data), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    }));

                });
            });
        }




        return target.apply(thisArg, argumentsList)
            .catch(console.error);
    }
})


})();

unsafeWindow.fetch = new Proxy(fetch, {
    apply: async function (target, thisArg, argumentsList) {
        const [fetchUrl, fetchOptions] = argumentsList;

        if (fetchUrl.includes('/backend-api/models')) {
            try {
                const realResponse = await target.apply(thisArg, argumentsList);
                const data = await realResponse.json();

                data.categories.push(customCategory);

                return new Response(JSON.stringify(data), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            } catch (error) {
                console.error('Error processing fetch response:', error);
                throw error;
            }
        }

        try {
            return await target.apply(thisArg, argumentsList);
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    }
});
