const DefaultConfig = {
    rowHeight: 30,
    barHeight: 20,
    scaleHeight: 30,
    gridWidth: 250,
    scrollSize: 15,
    cellWidth: 50,
    taskColor: "#3498db",
};

export function mergeConfig(userConfig) {
    return { ...DefaultConfig, ...userConfig };
}
