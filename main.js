// ==UserScript==
// @name         ChatGPT tools
// @version      1.0
// @description  Adds more models to ChatGPT and allows you to change the model before the message is sent
// @match        *://chatgpt.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    // // https://platform.openai.com/docs/models
    // // https://platform.openai.com/docs/deprecations
    // const MODELS = {
    //     //Official
    //     "Auto": "auto",
    //     "GPT 4o": "gpt-4o",
    //     "GPT 3.5": "text-davinci-002-render-sha",
    //     //Main
    //     "GPT 4": "gpt-4",
    //     "GPT 4 (Turbo)": "gpt-4-turbo",
    //     "GPT 4 (Mobile)": "gpt-4-mobile",
    //     "GPT 3.5 (Turbo)": "gpt-3.5-turbo",
    //     //Others aren't really documented but work
    //     "GPT 4": "text-davinci-003-render-sha",
    //     "Unknown": "text-davinci-002",
    // };

    function updateModelParameter(originalRequest) {
        const requestData = JSON.parse(originalRequest.body);
        requestData.model = prompt("Model");
        return { ...originalRequest, body: JSON.stringify(requestData) };
    }

    //TODO: Also do ratelimit display

    const originalFetch = window.fetch;
    window.fetch = async function() {
        if (arguments[0].includes('/backend-api/models')) {
            const realResponse = await originalFetch.apply(this, arguments);
            let data = await realResponse.json();

            data.models.push({"test": "test"});

            console.log("Response");
            console.log(data);

            return new Response(JSON.stringify(data), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (arguments[0] === "https://chatgpt.com/backend-api/conversation" && arguments[1].method === "POST" && arguments[1].body) {
            arguments[1] = updateModelParameter(arguments[1]);
        }
        return await originalFetch.apply(this, arguments);
    };

})();
