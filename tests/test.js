(function() {

function updateModelParameter(config, controlKeyIsDown, requestData) {

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
    // console.log(requestData.model);
    // requestData.model = config.quotaSaving.model;

    return requestData;
}


function testUpdateModelParameter(model, harshFiltering, controlKeyIsDown, expectedModel) {
    requestData = {model: model}
    config = {quotaSaving: {
        model: '3.5',
        harshFiltering: harshFiltering
    }}

    let output = updateModelParameter(config, controlKeyIsDown, requestData)
    if (output.model != expectedModel) {
        console.warn(`${model} ${harshFiltering ? 'harsh' : '     '} ${controlKeyIsDown ? 'down' : '    '} - ${output.model}  (expected ${expectedModel})`)
    } else {
    console.log(`${model} ${harshFiltering ? 'harsh' : '     '} ${controlKeyIsDown ? 'down' : '    '} - ${output.model}  (expected ${expectedModel})`)
    }
}

tests = [
    ['4o', true, false, '3.5'],
    ['4o', true, true, '4o'],
    ['4o', false, false, '4o'],
    ['4o', false, true, '4o'],
    ['3.5', true, false, '3.5'],
    ['3.5', true, true, '3.5'],
    ['3.5', false, false, '3.5'],
    ['3.5', false, true, '3.5'],
    ['auto', true, false, '3.5'],
    ['auto', true, true, 'auto'],
    ['auto', false, false, '3.5'],
    ['auto', false, true, 'auto'],
    ['4.0', true, false, '3.5'],
    ['4.0', true, true, '4.0'],
    ['4.0', false, false, '4.0'],
    ['4.0', false, true, '4.0']
]


tests.forEach(element => {
    testUpdateModelParameter(element[0], element[1], element[2], element[3]);
});

})()