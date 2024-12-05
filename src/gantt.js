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

        // 同步 hover
        gridRow.addEventListener('mouseover', () => {
            taskRow.classList.add('hover');
        });
        gridRow.addEventListener('mouseout', () => {
            taskRow.classList.remove('hover');
        });
        taskRow.addEventListener('mouseover', () => {
            gridRow.classList.add('hover');
        });
        taskRow.addEventListener('mouseout', () => {
            gridRow.classList.remove('hover');
        });

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
        const layout = DOMUtils.createElement('div', 'gantt_layout');

        const grid = DOMUtils.createElement("div", "gantt_grid");
        const gridScale = DOMUtils.createElement("div", "gantt_grid_scale");
        const gridArea = DOMUtils.createElement("div", "gantt_grid_area");

        this.timeline = DOMUtils.createElement("div", "gantt_timeline");
        const taskScale = DOMUtils.createElement("div", "gantt_task_scale");
        const taskArea = DOMUtils.createElement("div", "gantt_task_area");

        const horizontalScroll = DOMUtils.createElement("div", "gantt_horizontal_scroll");
        const horizontalScrollLine = DOMUtils.createElement("div", "gantt_horizontal_scroll_line");
        const verticalScroll = DOMUtils.createElement("div", "gantt_vertical_scroll");
        const verticalScrollLine = DOMUtils.createElement("div", "gantt_vertical_scroll_line");

        // console.log('create container');
        this.config = mergeConfig(config);
        this.eventManager = new EventManager();
        this.ganttTasks = new GanttTasks(taskArea, gridArea, this.config);

        // 动态设置宽度
        window.addEventListener('resize', this.#resize);

        // 初始化 UI
        document.body.appendChild(this.container);
        // gantt_layout
        layout.style.height = "calc(100% - " + this.config.scrollSize + "px)"
        this.container.appendChild(layout);

        // gantt_grid
        grid.style.width = this.config.gridWidth + "px";
        layout.appendChild(grid);
        // gantt_grid_scale
        gridScale.style.height = this.config.scaleHeight + "px";
        grid.appendChild(gridScale);
        // gantt_grid_area
        gridArea.style.height = "calc(100% - " + this.config.scaleHeight + "px)";
        grid.appendChild(gridArea);

        // gantt_timeline
        this.timeline.style.width = "calc(100% - " + (this.config.gridWidth + this.config.scrollSize) + "px)";
        layout.appendChild(this.timeline);
        // gantt_task_scale
        taskScale.style.height = this.config.scaleHeight + "px";
        this.timeline.appendChild(taskScale);
        // gantt_task_area
        taskArea.style.height = "calc(100% - " + this.config.scaleHeight + "px)";
        this.timeline.appendChild(taskArea);

        // gantt_vertical_scroll
        verticalScroll.style.width = this.config.scrollSize + "px";
        layout.appendChild(verticalScroll);
        verticalScroll.appendChild(verticalScrollLine);
        // gantt_horizontal_scroll
        horizontalScroll.style.height = this.config.scrollSize + "px";
        this.container.appendChild(horizontalScroll);
        horizontalScroll.appendChild(horizontalScrollLine);

        // 同步 scroll
        this.timeline.addEventListener('scroll', () => {
            // vertical
            grid.scrollTop = this.timeline.scrollTop;
            verticalScroll.scrollTop = this.timeline.scrollTop;

            // horizontal
            horizontalScroll.scrollLeft = this.timeline.scrollLeft;
        });
        grid.addEventListener('scroll', () => {
            // vertical
            this.timeline.scrollTop = grid.scrollTop;
            verticalScroll.scrollTop = grid.scrollTop;
        });
        verticalScroll.addEventListener('scroll', () => {
            // vertical
            this.timeline.scrollTop = verticalScroll.scrollTop;
            grid.scrollTop = verticalScroll.scrollTop;
        });
        horizontalScroll.addEventListener('scroll', () => {
            // horizontal
            this.timeline.scrollLeft = horizontalScroll.scrollLeft;
        });
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
        const contentWidth = this.timeline.scrollWidth + "px";
        document.querySelectorAll('.gantt_task_scale, .gantt_task_area').forEach(el => {
            el.style.width = contentWidth;
        });
        document.querySelector('.gantt_vertical_scroll_line').style.height = this.timeline.scrollHeight + 'px';
        document.querySelector('.gantt_horizontal_scroll_line').style.width = contentWidth;
    }

    #updateCells = () => {
        const cellWidth = 100;
        const taskRows = document.querySelectorAll('.gantt_task_row');
        const cellCount = Math.floor(this.timeline.scrollWidth / cellWidth) - 1;

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