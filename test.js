(function () {
    function testScript(model, harsh, controlDown) {
        let outmodel = model;
        if (model === '4o') {
            if (harsh && !controlDown) {
                outmodel = '3.5';
            }
        }
        else if (!controlDown) {
            outmodel = '3.5';
        }

        console.log(`model: ${model}, harsh: ${harsh}, controlDown: ${controlDown}, outmodel: ${outmodel}`);
    }

    testScript("3.5", true, true);
    testScript("3.5", true, false);
    testScript("3.5", false, true);
    testScript("3.5", false, false);
    testScript("auto", true, true);
    testScript("auto", true, false);
    testScript("auto", false, true);
    testScript("auto", false, false);
    testScript("4o", true, true);
    testScript("4o", true, false);
    testScript("4o", false, true);
    testScript("4o", false, false);
})();