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
    const dayjs = Gantt.dayjs;

    const tasks = [];
    tasks.push({name: 'Task' + (tasks.length + 1), start: '2024-12-20', end: '2024-12-22'});
    tasks.push({name: 'Task' + (tasks.length + 1), start: '2024-12-10', end: '2024-12-20'});
    tasks.push({name: 'Task' + (tasks.length + 1), start: '2024-12-9', end: '2024-12-15'});
    tasks.push({name: 'Task' + (tasks.length + 1), start: '2024-11-26', end: '2024-12-15'});

    let date = dayjs('2024-11-26');
    for (let i = 0; i < 10; i++) {
        tasks.push({
            name: 'Task' + (tasks.length + 1),
            start: date.format('YYYY-MM-DD'),
            end: date.add(2, 'day').format('YYYY-MM-DD')
        });
        date = date.add(1, 'day');
    }

    const config = [];
    const chart = new gantt(config);
    chart.on('afterTaskAdded', task => {
        console.log('Task added: ', task.name, task.start.format('YYYY-MM-DD'), task.end.format('YYYY-MM-DD'));
    });
    tasks.forEach(task => chart.addTask(task));

    function add() {
        tasks.push({name: 'Task' + (tasks.length + 1), start: date.format('YYYY-MM-DD'), end: date.add(2, 'day').format('YYYY-MM-DD')});
        chart.addTask(tasks[tasks.length - 1]);
    }
</script>
</body>
</html>


```

## Reference
https://webpack.docschina.org/guides/development/#using-webpack-dev-server


