(function () {
const controlKeyIsDown = false;
const action = "variant";
let model = "gpt-4";
const saveQuotaHarsh = true;

if (action === "variant") {
    if (saveQuotaHarsh  && !controlKeyIsDown) {
        model = "text-davinci-002-render-sha";
    }
}
else if (!controlKeyIsDown) {
    model = "text-davinci-002-render-sha";
}

console.log("Model: " + model);
})();