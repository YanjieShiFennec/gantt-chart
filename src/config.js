const DefaultConfig = {
    rowHeight: 30,
    barHeight: 20,
    scaleHeight: 30,

    // gridWidth: 250,
    gridNameWidth: 120,
    gridStartWidth: 110,
    gridDurationWidth: 80,

    scrollSize: 15,
    cellWidth: 50,
    taskColor: "#3498db",
};

export function mergeConfig(userConfig) {
    const config = {...DefaultConfig, ...userConfig};
    config.gridWidth = config.gridNameWidth + config.gridStartWidth + config.gridDurationWidth;
    return config;
}
