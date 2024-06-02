// ==UserScript==
// @name         ChatGPT No Track
// @version      1.0
// @description  Removes tracking from ChatGPT
// @match        *://chatgpt.com/*
// @run-at       document-start
// @grant        unsafeWindow
// @noframes
// ==/UserScript==

const hookFetch = function() {
    unsafeWindow.fetch = new Proxy(fetch, {
        apply: function (target, thisArg, argumentsList) {
            const fetchReqUrl = argumentsList[0];
            const fetchReqOptions = argumentsList[1];
            const fetchReqMethod = fetchReqOptions?.method?.toUpperCase();
            console.log(`fetch: ${fetchReqMethod} ${fetchReqUrl}`);
            let fetchRsp;
            try {
                const block_url = 'gravatar\.com|browser-intake-datadoghq\.com|\.wp\.com|intercomcdn\.com|sentry\.io|sentry_key=|intercom\.io|featuregates\.org|/v1/initialize|/messenger/|statsigapi\.net|/rgstr|/v1/sdk_exception';
                if (fetchReqUrl.match('/backend-api/moderations(\\?|$)')) {
                    //No Audit
                    fetchRsp = Promise.resolve({
                        json: () => {return {}}
                    });
                    return fetchRsp;
                }
                else if (fetchReqUrl.match('/backend-api/conversation(\\?|$)')) {
                    //No Audit
                    const post_body = JSON.parse(argumentsList[1].body);
                    post_body.supports_modapi = false;
                    argumentsList[1].body = JSON.stringify(post_body);
                }
                else if (fetchReqUrl.match(block_url)) {
                    //No tracking
                    console.log(`Tracking: ${fetchReqUrl}`);
                    fetchRsp = Promise.resolve({});
                    return fetchRsp
                }
                else if (fetchReqUrl.match('/backend-api/compliance')) {
                    //No compliance bug
                    fetchRsp = Promise.resolve({
                        json: () => {return {"registration_country":null,"require_cookie_consent":false,"terms_of_use":{"is_required":false,"display":null},"cookie_consent":null,"age_verification":null}}
                    });
                    return fetchRsp;
                }
            } catch (e) {}
            fetchRsp = target.apply(thisArg, argumentsList);
            return fetchRsp.then(response => {
                return response;
            }).catch(error => {
                console.error(error);
                return Promise.reject(error);
            });
        }
    });
    navigator.sendBeacon = function(url, data) {};
};