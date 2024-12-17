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

    getOffset() {
        return this.offset;
    }
}

export class GanttChart {
    constructor(config) {
        this.container = DOMUtils.createElement('div', 'gantt_container');
        const layout = DOMUtils.createElement('div', 'gantt_layout');

        const grid = DOMUtils.createElement("div", "gantt_grid");
        const gridScale = DOMUtils.createElement("div", "gantt_grid_scale");
        const gridArea = DOMUtils.createElement("div", "gantt_grid_area");

        const timeline = DOMUtils.createElement("div", "gantt_timeline");
        const taskScale = DOMUtils.createElement("div", "gantt_task_scale");
        const taskContent = DOMUtils.createElement("div", "gantt_task_content");

        const scaleLayout = DOMUtils.createElement("div", "gantt_scale_layout");

        this.taskLayout = DOMUtils.createElement("div", "gantt_task_layout");
        this.taskArea = DOMUtils.createElement("div", "gantt_task_area");
        const verticalScroll = DOMUtils.createElement("div", "gantt_vertical_scroll");
        const verticalScrollLine = DOMUtils.createElement("div", "gantt_vertical_scroll_line");

        const horizontalScroll = DOMUtils.createElement("div", "gantt_horizontal_scroll");
        const horizontalScrollLine = DOMUtils.createElement("div", "gantt_horizontal_scroll_line");

        // console.log('create container');
        this.config = mergeConfig(config);
        this.eventManager = new EventManager();
        this.ganttTasks = new GanttTasks(this.taskArea, gridArea, this.config);

        // 动态设置宽度
        // window.addEventListener('resize', this.#resize);

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
        timeline.style.width = "calc(100% - " + this.config.gridWidth + "px)";
        layout.appendChild(timeline);
        // gantt_task_scale
        taskScale.style.height = this.config.scaleHeight + "px";
        taskScale.style.width = "calc(100% - " + this.config.scrollSize + "px)";
        timeline.appendChild(taskScale);
        // gantt_task_content
        taskContent.style.height = "calc(100% - " + this.config.scaleHeight + "px)";
        timeline.appendChild(taskContent);

        // gantt_scale_layout
        taskScale.appendChild(scaleLayout);

        // gantt_task_layout
        this.taskLayout.style.width = "calc(100% - " + this.config.scrollSize + "px)";
        taskContent.appendChild(this.taskLayout);
        // gantt_task_area
        this.taskLayout.appendChild(this.taskArea);
        // gantt_vertical_scroll
        verticalScroll.style.width = this.config.scrollSize + "px";
        taskContent.appendChild(verticalScroll);
        verticalScroll.appendChild(verticalScrollLine);

        // gantt_horizontal_scroll
        horizontalScroll.style.height = this.config.scrollSize + "px";
        horizontalScroll.style.width = "calc(100% - " + this.config.scrollSize + "px)";
        this.container.appendChild(horizontalScroll);
        horizontalScroll.appendChild(horizontalScrollLine);

        // 同步 scroll
        this.taskArea.addEventListener('scroll', () => {
            // vertical
            gridArea.scrollTop = this.taskArea.scrollTop;
            verticalScroll.scrollTop = this.taskArea.scrollTop;

            // horizontal
            horizontalScroll.scrollLeft = this.taskArea.scrollLeft;
            taskScale.scrollLeft = this.taskArea.scrollLeft;
        });
        gridArea.addEventListener('scroll', () => {
            // vertical
            this.taskArea.scrollTop = gridArea.scrollTop;
            verticalScroll.scrollTop = gridArea.scrollTop;
        });
        verticalScroll.addEventListener('scroll', () => {
            // vertical
            this.taskArea.scrollTop = verticalScroll.scrollTop;
            gridArea.scrollTop = verticalScroll.scrollTop;
        });
        taskScale.addEventListener('scroll', () => {
            // horizontal
            this.taskArea.scrollLeft = taskScale.scrollLeft;
            horizontalScroll.scrollLeft = taskScale.scrollLeft;
        });
        horizontalScroll.addEventListener('scroll', () => {
            // horizontal
            this.taskArea.scrollLeft = horizontalScroll.scrollLeft;
            taskScale.scrollLeft = horizontalScroll.scrollLeft;
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
        document.querySelectorAll('.gantt_scale_layout, .gantt_task_row').forEach(el => {
            el.style.width = this.taskArea.scrollWidth + "px";
        });
        document.querySelector('.gantt_vertical_scroll_line').style.height = this.taskArea.scrollHeight + 'px';
        document.querySelector('.gantt_horizontal_scroll_line').style.width = (this.taskArea.scrollWidth + this.config.gridWidth) + "px";
    }

    #updateCells = () => {
        const cellWidth = 100;
        const taskRows = document.querySelectorAll('.gantt_task_row');
        const cellCount = Math.floor(this.taskArea.scrollWidth / cellWidth);

        // create task row cells
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

        const scaleLayout = document.querySelector('.gantt_scale_layout');
        let scaleCells = scaleLayout.querySelectorAll('.gantt_scale_cell');
        const offset = this.ganttTasks.getOffset();
        // create task scale cells
        const curCellCount = scaleCells.length;
        if (cellCount > curCellCount) {
            for (let i = 0; i < cellCount - curCellCount; i++) {
                const cell = DOMUtils.createElement("div", "gantt_scale_cell");
                // cell.id = 'gantt_cell_' + index + "_" + (i + curCellCount);
                cell.innerHTML = cellWidth * (i + curCellCount) + offset;
                cell.style.width = cellWidth + "px";
                cell.style.lineHeight = cell.style.height = this.config.scaleHeight + "px";
                scaleLayout.appendChild(cell);
            }
        }
        // update scale text
        scaleCells = scaleLayout.querySelectorAll('.gantt_scale_cell');
        const curOffset = parseInt(scaleCells.item(0).innerHTML);
        if (offset !== curOffset) {
            scaleCells.forEach((cell, index) => {
                cell.innerHTML = cellWidth * index + offset;
            });
        }

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