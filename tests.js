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
// If the message is new, change the model to the default unless the control key is pressed
else {
    if (!controlKeyIsDown) {
        model = "text-davinci-002-render-sha";
    }
}

console.log("Model: " + model);
})();