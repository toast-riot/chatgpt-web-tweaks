(function() {

function updateModelParameter() {

    console.log(requestData.model);

    if (requestData.model === '4o') {
        if (config.quotaSaving.harshFiltering && !controlKeyIsDown) {
            requestData.model = config.quotaSaving.model;
        }
    }
    else if (!controlKeyIsDown) {
        requestData.model = config.quotaSaving.model;
    }

    // requestData.model = prompt("Model", requestData.model);
    // console.log(requestData);

    // alert("Model: " + requestData.model);
    console.log(requestData.model);
    requestData.model = config.quotaSaving.model;
}

requestData = {model: '4o'}
config = {quotaSaving: {
    model: '3.5',
    harshFiltering: false
}}
controlKeyIsDown = false

updateModelParameter()

})()