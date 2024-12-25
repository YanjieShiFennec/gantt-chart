import {EventManager} from "./events";
import {DOMUtils} from "./dom";
import {mergeConfig} from "./config";
import './style.css';
import dayjs from "dayjs";

class GanttTasks {
    #offset;
    #left;
    #gridRows = {};
    #taskRows = {};
    #lastClickId = -1;

    constructor(taskArea, gridArea, config) {
        this.taskArea = taskArea;
        this.gridArea = gridArea;
        this.config = config;
        this.tasks = [];
        this.#offset = dayjs();
        this.#left = 0; // 最近增加的任务的 left 值
    }

    addTask(task) {
        const taskName = task.name || '';
        const taskStart = dayjs(task.start);
        const taskEnd = dayjs(task.end);
        const taskDuration = taskEnd.diff(taskStart, 'day') + 1;
        const contentTop = (this.config.rowHeight - this.config.barHeight) / 2 + "px";

        // gantt_task_row
        const taskRow = DOMUtils.createElement("div", "gantt_task_row");
        taskRow.style.height = this.config.rowHeight + "px";
        this.taskArea.appendChild(taskRow);
        // gantt_grid_row
        const gridRow = DOMUtils.createElement("div", "gantt_grid_row");
        gridRow.style.height = this.config.rowHeight + "px";
        this.gridArea.appendChild(gridRow);

        // gantt_grid_name
        const gridName = DOMUtils.createElement("div", "gantt_cell");
        gridName.style.width = this.config.gridNameWidth + "px";
        gridRow.appendChild(gridName);
        const gridNameContent = DOMUtils.createElement("span", "gantt_grid_content");
        gridNameContent.style.top = contentTop;
        gridNameContent.innerHTML = taskName;
        gridName.appendChild(gridNameContent);

        // gantt_grid_start
        const gridStart = DOMUtils.createElement("div", "gantt_cell");
        gridStart.style.width = this.config.gridStartWidth + "px";
        gridRow.appendChild(gridStart);
        const gridStartContent = DOMUtils.createElement("span", "gantt_grid_content");
        gridStartContent.style.top = contentTop;
        gridStartContent.innerHTML = task.start;
        gridStart.appendChild(gridStartContent);

        // gantt_grid_duration
        const gridDuration = DOMUtils.createElement("div", "gantt_cell");
        // gridDuration.style.borderRight = 'none';
        // gridDuration.style.width = this.config.gridDurationWidth + "px";
        gridDuration.style.width = "calc(100% - " + (this.config.gridNameWidth + this.config.gridStartWidth) + "px)";
        gridRow.appendChild(gridDuration);
        const gridDurationContent = DOMUtils.createElement("span", "gantt_grid_content");
        gridDurationContent.style.top = contentTop;
        gridDurationContent.innerHTML = taskDuration;
        gridDuration.appendChild(gridDurationContent);

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

        // task.start = dayjs(task.start);
        // task.end = dayjs(task.end);
        if (taskStart.isBefore(this.#offset, 'day')) {
            this.#offset = taskStart;

            // update all task bars
            this.taskArea.querySelectorAll(".gantt_task_bar").forEach((taskBar) => {
                taskBar.style.left = dayjs(taskBar.dataset.start).diff(this.#offset, 'day') * this.config.cellWidth + "px";
            });
        }

        // gantt_task_bar
        const taskBar = DOMUtils.createElement("div", "gantt_task_bar");
        const left = taskStart.diff(this.#offset, 'day') * this.config.cellWidth;
        taskBar.style.lineHeight = taskBar.style.height = this.config.barHeight + "px";
        taskBar.style.top = contentTop;
        taskBar.style.left = left + "px";
        taskBar.style.width = taskDuration * this.config.cellWidth + "px";
        taskBar.innerHTML = taskName;
        taskBar.dataset.start = task.start;
        taskRow.appendChild(taskBar);

        // 左键单击增加选中样式
        const addClickListener = (el) => {
            el.addEventListener('click', () => {
                if (this.#lastClickId !== -1) {
                    DOMUtils.removeClass(this.#gridRows[this.#lastClickId], 'selected');
                    DOMUtils.removeClass(this.#taskRows[this.#lastClickId], 'selected');
                }
                this.#lastClickId = task.id;
                DOMUtils.addClass(gridRow, 'selected');
                DOMUtils.addClass(taskRow, 'selected');
            });
        }
        addClickListener(gridRow);
        addClickListener(taskBar);

        task.id = this.tasks.length;
        this.tasks.push(task);
        this.#gridRows[task.id] = gridRow;
        this.#taskRows[task.id] = taskRow;
        this.#left = left;
    }

    getOffset() {
        return this.#offset;
    }

    getLeft() {
        return this.#left;
    }
}

export class GanttChart {
    constructor(config) {
        this.container = DOMUtils.createElement('div', 'gantt_container');
        const layout = DOMUtils.createElement('div', 'gantt_layout');

        const grid = DOMUtils.createElement("div", "gantt_grid");
        const gridScale = DOMUtils.createElement("div", "gantt_grid_scale");
        const gridScaleName = DOMUtils.createElement("div", "gantt_cell");
        const gridScaleStart = DOMUtils.createElement("div", "gantt_cell");
        const gridScaleDuration = DOMUtils.createElement("div", "gantt_cell");
        const gridArea = DOMUtils.createElement("div", "gantt_grid_area");

        const timeline = DOMUtils.createElement("div", "gantt_timeline");
        const taskScale = DOMUtils.createElement("div", "gantt_task_scale");
        const taskContent = DOMUtils.createElement("div", "gantt_task_content");

        const scaleDayLayout = DOMUtils.createElement("div", "gantt_scale_day_layout");
        const scaleMonthLayout = DOMUtils.createElement("div", "gantt_scale_month_layout");
        const scaleYearLayout = DOMUtils.createElement("div", "gantt_scale_year_layout");
        DOMUtils.addClass(scaleDayLayout, "gantt_scale_layout");
        DOMUtils.addClass(scaleMonthLayout, "gantt_scale_layout");
        DOMUtils.addClass(scaleYearLayout, "gantt_scale_layout");

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
        const gridScaleHeight = this.config.scaleHeight * 3;
        gridScale.style.height = gridScaleHeight + "px";
        grid.appendChild(gridScale);
        // gridScaleName
        gridScaleName.style.width = this.config.gridNameWidth + "px";
        gridScaleName.style.lineHeight = gridScaleHeight + "px";
        gridScaleName.innerHTML = 'Task Name';
        gridScale.appendChild(gridScaleName);
        // gridScaleStart
        gridScaleStart.style.width = this.config.gridStartWidth + "px";
        gridScaleStart.style.lineHeight = gridScaleHeight + "px";
        gridScaleStart.innerHTML = 'Start Time';
        gridScale.appendChild(gridScaleStart);
        // gridScaleDuration
        gridScaleDuration.style.width = "calc(100% - " + (this.config.gridNameWidth + this.config.gridStartWidth) + "px)";
        gridScaleDuration.style.lineHeight = gridScaleHeight + "px";
        gridScaleDuration.innerHTML = 'Duration';
        gridScale.appendChild(gridScaleDuration);

        // gantt_grid_area
        gridArea.style.height = "calc(100% - " + gridScaleHeight + "px)";
        grid.appendChild(gridArea);

        // gantt_timeline
        timeline.style.width = "calc(100% - " + this.config.gridWidth + "px)";
        layout.appendChild(timeline);
        // gantt_task_scale
        taskScale.style.height = gridScaleHeight + "px";
        taskScale.style.width = "calc(100% - " + this.config.scrollSize + "px)";
        timeline.appendChild(taskScale);
        // gantt_task_content
        taskContent.style.height = "calc(100% - " + gridScaleHeight + "px)";
        timeline.appendChild(taskContent);

        // gantt_scale_layout
        const scaleHeight = this.config.scaleHeight + "px";
        scaleDayLayout.style.height = scaleHeight;
        scaleMonthLayout.style.height = scaleHeight;
        scaleYearLayout.style.height = scaleHeight;
        taskScale.appendChild(scaleYearLayout);
        taskScale.appendChild(scaleMonthLayout);
        taskScale.appendChild(scaleDayLayout);

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
        this.addBatchTasks([task]);
    }

    addBatchTasks(tasks) {
        tasks.forEach(task => {
            this.eventManager.trigger("beforeTaskAdded", task);
            this.ganttTasks.addTask(task);
            this.eventManager.trigger("afterTaskAdded", task);
        });

        this.#resize();
        this.#updateCells();

        // 强制滚动到最近增加的任务行
        this.taskArea.scrollTop = this.taskArea.scrollHeight;
        this.taskArea.scrollLeft = this.ganttTasks.getLeft();
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
        const cellWidth = this.config.cellWidth;
        const taskRows = document.querySelectorAll('.gantt_task_row');
        const cellCount = Math.floor(this.taskArea.scrollWidth / cellWidth);

        // create task row cells
        taskRows.forEach((taskRow, index) => {
            const curCellCount = taskRow.querySelectorAll('.gantt_cell').length;
            if (cellCount > curCellCount) {
                for (let i = 0; i < cellCount - curCellCount; i++) {
                    const cell = DOMUtils.createElement("div", "gantt_cell");
                    // cell.id = 'gantt_cell_' + index + "_" + (i + curCellCount);
                    cell.style.width = cellWidth + "px";
                    cell.style.height = this.config.rowHeight + "px";
                    taskRow.appendChild(cell);
                }
            }
        });

        // create task scale cells
        const scaleDayLayout = document.querySelector('.gantt_scale_day_layout');
        const scaleMonthLayout = document.querySelector('.gantt_scale_month_layout');
        const scaleYearLayout = document.querySelector('.gantt_scale_year_layout');
        let scaleDayCells = scaleDayLayout.querySelectorAll('.gantt_cell');
        const offset = this.ganttTasks.getOffset();
        const curCellCount = scaleDayCells.length;
        if (cellCount > curCellCount) {
            for (let i = 0; i < cellCount - curCellCount; i++) {
                const date = offset.add((i + curCellCount), 'day');
                const dateStr = date.format('YYYY-MM-DD');

                // gantt_scale_day_layout
                const cell = DOMUtils.createElement("div", "gantt_cell");
                // cell.id = 'gantt_cell_' + index + "_" + (i + curCellCount);
                cell.dataset.date = dateStr;
                cell.innerHTML = date.format('DD');
                cell.style.width = cellWidth + "px";
                cell.style.lineHeight = this.config.scaleHeight + "px";
                scaleDayLayout.appendChild(cell);

                // gantt_scale_month_layout
                const cell1 = DOMUtils.createElement("div", "gantt_cell");
                cell1.dataset.date = dateStr;
                cell1.innerHTML = date.format('MMM');
                cell1.style.width = cellWidth + "px";
                cell1.style.lineHeight = this.config.scaleHeight + "px";
                scaleMonthLayout.appendChild(cell1);

                // gantt_scale_year_layout
                const cell2 = DOMUtils.createElement("div", "gantt_cell");
                cell2.dataset.date = dateStr;
                cell2.innerHTML = date.format('YYYY');
                cell2.style.width = cellWidth + "px";
                cell2.style.lineHeight = this.config.scaleHeight + "px";
                scaleYearLayout.appendChild(cell2);
            }
        }
        // update scale text
        scaleDayCells = scaleDayLayout.querySelectorAll('.gantt_cell');
        const scaleMonthCells = scaleMonthLayout.querySelectorAll('.gantt_cell');
        const scaleYearCells = scaleYearLayout.querySelectorAll('.gantt_cell');
        let curOffset = dayjs(scaleDayCells.item(0).dataset.date);
        if (!offset.isSame(curOffset, 'day')) {
            for (let i = 0; i < scaleDayCells.length; i++) {
                const date = offset.add(i, 'day');
                const dateStr = date.format('YYYY-MM-DD');
                // gantt_scale_day_layout
                scaleDayCells.item(i).dataset.date = dateStr;
                scaleDayCells.item(i).innerHTML = date.format('DD');
                // gantt_scale_month_layout
                scaleMonthCells.item(i).dataset.date = dateStr;
                scaleMonthCells.item(i).innerHTML = date.format('MMM');
                // gantt_scale_year_layout
                scaleYearCells.item(i).dataset.date = dateStr;
                scaleYearCells.item(i).innerHTML = date.format('YYYY');
            }
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