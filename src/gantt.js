import {EventManager} from "./events";
import {DOMUtils} from "./dom";
import {mergeConfig} from "./config";
import './style.css';

class GanttTasks {
    constructor(taskArea, gridArea, config) {
        this.taskArea = taskArea;
        this.gridArea = gridArea;
        this.config = config;
        this.tasks = [];
        this.offset = 0;
    }

    addTask(task) {
        const taskName = task.name || '';
        const contentTop = (this.config.rowHeight - this.config.barHeight) / 2 + "px";

        // gantt_task_row
        const taskRow = DOMUtils.createElement("div", "gantt_task_row");
        taskRow.style.height = this.config.rowHeight + "px";
        this.taskArea.appendChild(taskRow);
        // gantt_grid_row
        const gridRow = DOMUtils.createElement("div", "gantt_grid_row");
        gridRow.style.height = this.config.rowHeight + "px";
        this.gridArea.appendChild(gridRow);
        // gantt_grid_content
        const gridContent = DOMUtils.createElement("span", "gantt_grid_content");
        gridContent.style.top = contentTop;
        gridContent.innerHTML = taskName;
        gridRow.appendChild(gridContent);

        if (task.start < this.offset) {
            this.offset = task.start;

            // update all task bars
            this.taskArea.querySelectorAll(".gantt_task_bar").forEach((taskBar) => {
                taskBar.style.left = taskBar.dataset.start - this.offset + "px";
            });
        }

        // gantt_task_bar
        const taskBar = DOMUtils.createElement("div", "gantt_task_bar");
        taskBar.style.lineHeight = taskBar.style.height = this.config.barHeight + "px";
        taskBar.style.top = contentTop;
        taskBar.style.left = task.start - this.offset + "px";
        taskBar.style.width = task.end - task.start + "px";
        taskBar.innerHTML = taskName;
        taskBar.dataset.start = task.start;
        taskRow.appendChild(taskBar);

        task.id = this.tasks.length;
        this.tasks.push(task);
    }
}

export class GanttChart {
    constructor(config) {
        this.container = DOMUtils.createElement('div', 'gantt_container');
        const grid = DOMUtils.createElement("div", "gantt_grid");
        const gridScale = DOMUtils.createElement("div", "gantt_grid_scale");
        const gridArea = DOMUtils.createElement("div", "gantt_grid_area");
        this.timeline = DOMUtils.createElement("div", "gantt_timeline");
        const taskScale = DOMUtils.createElement("div", "gantt_task_scale");
        const taskArea = DOMUtils.createElement("div", "gantt_task_area");

        // console.log('create container');
        this.config = mergeConfig(config);
        this.eventManager = new EventManager();
        this.ganttTasks = new GanttTasks(taskArea, gridArea, this.config);

        // 动态设置宽度
        window.addEventListener('resize', this.#resize);

        // 初始化 UI
        document.body.appendChild(this.container);
        // gantt_grid
        grid.style.width = this.config.gridWidth + "px";
        this.container.appendChild(grid);
        // gantt_grid_scale
        gridScale.style.height = this.config.scaleHeight + "px";
        grid.appendChild(gridScale);
        // gantt_grid_area
        gridArea.style.height = "calc(100% - " + this.config.scaleHeight + "px)";
        grid.appendChild(gridArea);
        // gantt_timeline
        this.timeline.style.width = "calc(100% - " + this.config.gridWidth + "px)";
        this.container.appendChild(this.timeline);
        // gantt_task_scale
        taskScale.style.height = this.config.scaleHeight + "px";
        this.timeline.appendChild(taskScale);
        // gantt_task_area
        taskArea.style.height = "calc(100% - " + this.config.scaleHeight + "px)";
        this.timeline.appendChild(taskArea);
    }

    addTask(task) {
        this.eventManager.trigger("beforeTaskAdded", task);
        this.ganttTasks.addTask(task);
        this.#resize();
        this.#updateCells();
        this.eventManager.trigger("afterTaskAdded", task);
    }

    // 注册事件
    on(event, handler) {
        this.eventManager.on(event, handler);
    }

    #resize = () => {
        document.querySelectorAll('.gantt_task_scale, .gantt_task_area').forEach(el => {
            el.style.width = this.timeline.scrollWidth + 'px';
        });
    }

    #updateCells = () => {
        const cellWidth = 100;
        const taskRows = document.querySelectorAll('.gantt_task_row');
        const cellCount = Math.floor(this.timeline.scrollWidth / cellWidth);

        // create cells
        taskRows.forEach((taskRow, index) => {
            const curCellCount = taskRow.querySelectorAll('.gantt_task_cell').length;
            if (cellCount > curCellCount) {
                for (let i = 0; i < cellCount - curCellCount; i++) {
                    const cell = DOMUtils.createElement("div", "gantt_task_cell");
                    // cell.id = 'gantt_cell_' + index + "_" + (i + curCellCount);
                    cell.style.width = cellWidth + "px";
                    cell.style.height = this.config.rowHeight + "px";
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
}