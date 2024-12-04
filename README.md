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
<script src="./main.js"></script>
<script>
    const gantt = Gantt.GanttChart;
    const tasks = [
        {start: 0, end: 100},
        {start: 200, end: 300},
        {start: 150, end: 300},
    ];
    const config = [];
    const chart = new gantt(config);
    chart.on('afterTaskAdded', task => {
        console.log('Task added: ', task.name, task.start, task.end);
    });
    tasks.forEach(task => chart.addTask(task));
</script>
</body>
</html>

```


