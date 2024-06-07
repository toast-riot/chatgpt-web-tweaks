(function() {

function updateModelParameter(config, controlKeyIsDown, requestData) {

    // if (requestData.model == 'auto') {
    //     if (controlKeyIsDown) {
    //         return requestData;
    //     }
    //     requestData.model = config.quotaSaving.model;
    //     return requestData
    // }
    // if (!controlKeyIsDown && config.quotaSaving.harshFiltering) {
    //     requestData.model = config.quotaSaving.model;
    // }


    // if (requestData.model == 'auto' && !controlKeyIsDown) {
    //     requestData.model = config.quotaSaving.model;
    // }
    // else if (!controlKeyIsDown && config.quotaSaving.harshFiltering) {
    //     requestData.model = config.quotaSaving.model;
    // }

    if (!controlKeyIsDown) {
        if (!requestData.model in config.quotaSaving.exclude) {
            requestData.model = config.quotaSaving.model;
        }
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
        model: 'save',
        exclude: ['4.0'],
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
    ['auto', true, false, 'save'],
    ['auto', true, true, 'auto'],
    ['auto', false, false, 'save'],
    ['auto', false, true, 'auto'],
    ['4o', true, false, '4o'],
    ['4o', true, true, '4o'],
    ['4o', false, false, '4o'],
    ['4o', false, true, '4o'],
    ['4.0', true, false, 'save'],
    ['4.0', true, true, '4.0'],
    ['4.0', false, false, '4.0'],
    ['4.0', false, true, '4.0'],
    ['3.5', true, false, 'save'],
    ['3.5', true, true, 'save'],
    ['3.5', false, false, 'save'],
    ['3.5', false, true, 'save'],
]


tests.forEach(element => {
    testUpdateModelParameter(element[0], element[1], element[2], element[3]);
});

})()