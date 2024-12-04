import {EventManager} from "./events";
import {DOMUtils} from "./dom";
import {mergeConfig} from "./config";
import './style.css';

class GanttTasks {
    constructor(container, config) {
        this.container = container;
        this.config = config;
        this.tasks = [];
        this.offset = 0;
    }

    addTask(task) {
        const taskRow = DOMUtils.createElement("div", "gantt_task_row");
        taskRow.style.height = this.config.rowHeight + "px";
        this.container.appendChild(taskRow);

        if (task.start < this.offset) {
            this.offset = task.start;

            // update all task bars
            this.container.querySelectorAll(".gantt_task_bar").forEach((taskBar) => {
                taskBar.style.left = taskBar.dataset.start - this.offset + "px";
            });
        }

        const taskBar = DOMUtils.createElement("div", "gantt_task_bar");
        taskBar.style.lineHeight = taskBar.style.height = this.config.barHeight + "px";
        taskBar.style.top = (this.config.rowHeight - this.config.barHeight) / 2 + "px";
        taskBar.style.left = task.start - this.offset + "px";
        taskBar.style.width = task.end - task.start + "px";
        taskBar.innerHTML = task.name || '';
        taskBar.dataset.start = task.start;
        taskRow.appendChild(taskBar);

        task.id = this.tasks.length;
        this.tasks.push(task);
    }
}

export class GanttChart {
    constructor(config) {
        const scale = DOMUtils.createElement("div", "gantt_scale");
        const timeline = DOMUtils.createElement("div", "gantt_timeline");
        this.container = DOMUtils.createElement('div', 'gantt_container');
        // console.log('create container');
        this.config = mergeConfig(config);
        this.eventManager = new EventManager();
        this.ganttTasks = new GanttTasks(timeline, this.config);

        // 动态设置宽度
        window.addEventListener('resize', function () {
            resize();
        });

        // 初始化 UI
        document.body.appendChild(this.container);
        scale.style.height = this.config.scaleHeight + "px";
        this.container.appendChild(scale);
        timeline.style.height = "calc(100% - " + this.config.scaleHeight + "px)";
        this.container.appendChild(timeline);
    }

    addTask(task) {
        this.eventManager.trigger("beforeTaskAdded", task);
        this.ganttTasks.addTask(task);
        resize();
        updateCells(this.config.rowHeight);
        this.eventManager.trigger("afterTaskAdded", task);
    }

    // 注册事件
    on(event, handler) {
        this.eventManager.on(event, handler);
    }
}

function resize() {
    const container = document.querySelector('.gantt_container');
    container.style.width = window.innerWidth + 'px';
    const contentWidth = container.scrollWidth; // 获取实际内容宽度
    document.querySelectorAll('.gantt_scale, .gantt_timeline').forEach(el => {
        el.style.width = contentWidth + 'px';
    });
}

function updateCells(rowHeight) {
    const container = document.querySelector('.gantt_container');
    const cellWidth = 100;
    const taskRows = document.querySelectorAll('.gantt_task_row');
    const cellCount = Math.floor(container.scrollWidth / cellWidth);

    // create cells
    taskRows.forEach((taskRow, index) => {
        const curCellCount = taskRow.querySelectorAll('.gantt_task_cell').length;
        if (cellCount > curCellCount) {
            for (let i = 0; i < cellCount - curCellCount; i++) {
                const cell = DOMUtils.createElement("div", "gantt_task_cell");
                cell.id = 'gantt_cell_' + index + "_" + (i + curCellCount);
                cell.style.width = cellWidth + "px";
                cell.style.height = rowHeight + "px";
                taskRow.appendChild(cell);
            }
        }
    });

    // const curCellCount = taskRows.item(0).querySelectorAll('.gantt_task_cell').length;
    // if (cellCount > curCellCount) {
    //     // create cells
    //     taskRows.forEach((taskRow, index) => {
    //         for (let i = 0; i < cellCount - curCellCount; i++) {
    //             console.log(index, i);
    //             const cell = DOMUtils.createElement("div", "gantt_task_cell");
    //             cell.id = 'gantt_cell_' + index + "_" + (i + curCellCount);
    //             cell.style.width = cellWidth + "px";
    //             cell.style.height = rowHeight + "px";
    //             taskRow.appendChild(cell);
    //         }
    //     });
    // } else if (cellCount < curCellCount) {
    //     // delete  cells
    //     taskRows.forEach((taskRow, index) => {
    //         for (let i = 0; i < curCellCount - cellCount; i++) {
    //             const cell = taskRow.querySelector('#gantt_cell_' + index + "_" + (i + cellCount));
    //             taskRow.removeChild(cell);
    //         }
    //     });
    // }
}
