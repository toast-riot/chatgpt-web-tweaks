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

    function updateModelParameter(originalRequest) {
        const requestData = JSON.parse(originalRequest.body);

        requestData.model = prompt("Model");
        // requestData.model = "text-davinci-002-render-sha";

        console.log(requestData);

        return { ...originalRequest, body: JSON.stringify(requestData) };
    }

    const originalFetch = window.fetch;
    window.fetch = async function() {
        if (arguments[0] === "https://chatgpt.com/backend-api/conversation" && arguments[1].method === "POST" && arguments[1].body) {
            arguments[1] = updateModelParameter(arguments[1]);
        }
        return await originalFetch.apply(this, arguments);
    };
})();
