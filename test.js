(function () {
    function testScript(action, harsh, controlDown) {
        let model = 'auto';

        if (action === "variant") {
            if (harsh && !controlDown) {
                model = '3.5';
            }
        }
        else if (!controlDown) {
            model = '3.5';
        }

        console.log(`action: ${action}, harsh: ${harsh}, controlDown: ${controlDown}, model: ${model}`);
    }

    testScript("variant", true, true);
    testScript("variant", true, false);
    testScript("variant", false, true);
    testScript("variant", false, false);
    testScript("other", true, true);
    testScript("other", true, false);
    testScript("other", false, true);
    testScript("other", false, false);
})();