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

    //https://greasyfork.org/ru/scripts/494909-chatgpt-backend-api-hook/code
    //https://rentry.org/5a8vx

    const customModels = [
        {name: "GPT-4", slug: "gpt-4", description: "GPT-4", short_name: "4", max_tokens: 8192},
        {name: "GPT-4 (Turbo)", slug: "gpt-4-turbo", description: "GPT-4 Turbo", short_name: "4T", max_tokens: 128000}
    ];

    const originalFetch = window.fetch;
    window.fetch = async function() {
        if (arguments[0].includes('/backend-api/models')) {
            const realResponse = await originalFetch.apply(this, arguments);
            let data = await realResponse.json();

            customModels.forEach(model => {
                let customModel = new ModelCategory(model);
                data.models.push(customModel.model);
                data.categories.push(customModel.category);
            });

            console.log(data);


            return new Response(JSON.stringify(data), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        return await originalFetch.apply(this, arguments);
    };

})();
