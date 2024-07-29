// ==UserScript==
// @name         customModels
// @match        *://chatgpt.com/*
// @run-at       document-start
// @grant        unsafeWindow
// ==/UserScript==


// If I ever go adding more categories, I'll probably also make a hook for the icon request, so I can use custom icons too.

(function () {
    "use strict";

    class Model {
        constructor({name, slug, description, max_tokens}) {
            this.slug = slug;
            this.max_tokens = max_tokens;
            this.title = name;
            this.description = description;
            this.tags = [];
            this.capabilities = {};
            this.product_features = {};
        }
    }

    class Category {
        constructor({name, slug, description, short_name}) {
            this.category = name.toLowerCase().replace(/[\s-]+/g, "_");
            this.human_category_name = name;
            this.human_category_short_name = short_name || name;
            this.color = "#000000";
            this.icon = "";
            this.subscription_level = "free";
            this.default_model = slug;
            this.short_explainer = description;
            this.tagline = description;
        }
    }

    class ModelCategory {
        constructor({name, slug, description, short_name, max_tokens}) {
            this.model = new Model({name, slug, description, max_tokens});
            this.category = new Category({name, slug, description, short_name});
        }
    }

    // // https://platform.openai.com/docs/models
    // // https://platform.openai.com/docs/deprecations
    //https://greasyfork.org/ru/scripts/494909-chatgpt-backend-api-hook/code
    //https://rentry.org/5a8vx (Includes account flags)
    // const MODELS = {
    //     //Official
    //     "Auto": "auto",
    //     "GPT 4o": "gpt-4o",
    //     "GPT 3.5": "text-davinci-002-render-sha", //Don't use 'gpt-3.5' unless also adding a custom category
    //     //Main
    //     "GPT 4": "gpt-4",
    //     "GPT 4 (Turbo)": "gpt-4-turbo",
    //     "GPT 4 (Mobile)": "gpt-4-mobile",
    //     "GPT 3.5 (Turbo)": "gpt-3.5-turbo",
    //     //Others aren't really documented but work
    //     "GPT 4": "text-davinci-003-render-sha",
    //     "Unknown": "text-davinci-002",
    // };


    // const customModels = [
    //     {name: "GPT-3.5", slug: "text-davinci-002-render-sha", description: "GPT-3.5", short_name: "3.5", max_tokens: 16385}
    // ];
    const customModelsAndCategories = [
        new ModelCategory({name: "Monke", slug: "text-davinci-002-render-sha", description: "Reject humanity", short_name: "M", max_tokens: 16385})
    ];

    unsafeWindow.fetch = new Proxy(fetch, {
        apply: function (target, thisArg, argumentsList) {
            const [fetchUrl, fetchOptions] = argumentsList;

            if (fetchUrl.includes('/backend-api/models')) {
                return new Promise((resolve, reject) => {

                    const realResponse = target.apply(thisArg, argumentsList);
                    realResponse.then(async response => {

                        let data = await response.json();

                        customModelsAndCategories.forEach(extra => {
                            data.models.push(extra.model);
                            data.categories.push(extra.category);
                        });

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

    // const originalFetch = window.fetch;
    // window.fetch = async function() {
    //     console.log("Fetching", arguments[0]);
    //     if (arguments[0].includes('/backend-api/models')) {
    //         const realResponse = await originalFetch.apply(this, arguments);
    //         let data = await realResponse.json();

    //         customModels.forEach(model => {
    //             let customModel = new ModelCategory(model);
    //             data.models.push(customModel.model);
    //             data.categories.push(customModel.category);
    //         });

    //         console.log(data);


    //         return new Response(JSON.stringify(data), {
    //             status: 200,
    //             headers: { 'Content-Type': 'application/json' }
    //         });
    //     }
    //     return await originalFetch.apply(this, arguments);
    // };

})();
