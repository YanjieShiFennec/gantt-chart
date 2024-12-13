## Structure
```
├── src/  
│   ├── dom.js        # DOM 操作模块  
│   ├── events.js     # 事件管理模块  
│   ├── gantt.js      # 核心甘特图类  
│   ├── config.js     # 配置管理  
│   └── index.js     # 接口暴露  
├── dist/  
│   └── main.js # 打包后的文件  
├── webpack.config.js  # 打包配置  
├── package.json  
└── README.md  
```

## Usage

```bash
npm run build
```

```html
<!doctype html>
<html>
<head>
    <title>Gantt</title>
    <style>
    </style>
</head>
<body>
<div>
    <!--<button onclick="add()">add</button>-->
</div>
<script src="./main.js"></script>
<script>
    const gantt = Gantt.GanttChart;

    const tasks = [];
    const count = 50;
    for (let i = 1; i < 1 + count; i++) {
        tasks.push({name: 'Task' + i, start: 100 * (i - 1), end: 100 * (i + 5)});
        // tasks.push({name: 'Task' + i, start: -100 * (i + 1), end: -100 * (i - 1)});
    }
    // tasks.push({name: 'Task' + (tasks.length + 1), start: -100, end: 50});
    // tasks.push({name: 'Task' + (tasks.length + 1), start: -200, end: 100});
    // tasks.push({name: 'Task' + (tasks.length + 1), start: -300, end: 100});
    // tasks.push({name: 'Task' + (tasks.length + 1), start: -400, end: 200});

    const config = [];
    const chart = new gantt(config);
    chart.on('afterTaskAdded', task => {
        console.log('Task added: ', task.name, task.start, task.end);
    });
    tasks.forEach(task => chart.addTask(task));

    function add() {
        // tasks.push({name: 'Task' + (tasks.length + 1), start: 100 * tasks.length, end: 100 * (tasks.length + 2)});
        tasks.push({name: 'Task' + (tasks.length + 1), start: -200, end: 0});
        chart.addTask(tasks[tasks.length - 1]);
    }
</script>
</body>
</html>

```

## Reference
https://webpack.docschina.org/guides/development/#using-webpack-dev-server


