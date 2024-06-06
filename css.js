const config = {
    elementBlocker: false,
    blockElements: {
        //- Misc
        //ChatGPT can make mistakes
        '.md\\:px-\\[60px\\].text-token-text-secondary.text-xs.text-center.py-2.px-2.relative > span': true,
        //Chat suggestions
        '.gap-4.justify-center.items-stretch.flex-wrap.max-w-3xl.flex.mt-12.mx-3': true,
        //GPT pfp
        '.items-end.relative.flex-col.flex.flex-shrink-0': true,

        //- No premium
        //Upgrade plan sidebar item
        '.dark\\:border-white\\/20.juice\\:py-2.empty\\:hidden.pt-2.flex-col.flex': true,

        //- Feedback
        //Bad response button
        '.flex.p-1.rounded-xl.justify-start.items-center > .items-center.flex > .flex > span > .hover\\:bg-token-main-surface-secondary.text-token-text-secondary.rounded-lg > .justify-center.items-center.w-\\[30px\\].h-\\[30px\\].flex': true,
        //Is this conversation helpful so far
        '.empty\\:hidden.w-full.mt-3': true
    },
    elementBlockerDebug: true,
    customCSS: ``
}

//- Custom CSS
function customCSS() {
    let css = config.customCSS || '';

    if (config.elementBlocker) {
        Object.entries(config.blockElements).forEach(([selector, block]) => {
            if (!block) return;
            css += `${selector} {\n\t${config.elementBlockerDebug ? 'outline: 1px solid red !important' : 'display: none !important'};\n}\n`;
        });
    }

    if (!css) return;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
}

customCSS();
