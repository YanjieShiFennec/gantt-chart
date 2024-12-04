export class EventManager {
    constructor() {
        this.events = {};
    }

    // 注册事件
    on(event, handler) {
        this.events[event] = this.events[event] || [];
        this.events[event].push(handler);
    }

    // 触发事件
    trigger(event, ...args) {
        if (this.events[event]) {
            this.events[event].forEach((handler) => handler(...args));
        }
    }

    // 移除事件
    off(event, handler) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(h => h !== handler);
        }
    }
}
