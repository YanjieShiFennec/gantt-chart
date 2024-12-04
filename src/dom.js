export const DOMUtils = {
    createElement: (tag, className) => {
        const el = document.createElement(tag);
        if (className) el.className = className;
        return el;
    },
    addClass: (el, className) => {
        if (!el.classList.contains(className)) el.classList.add(className);
    },
    removeClass: (el, className) => {
        el.classList.remove(className);
    },
};
