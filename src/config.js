const DefaultConfig = {
    rowHeight: 30,
    barHeight: 20,
    scaleHeight: 80,
    gridWidth: 250,
    taskColor: "#3498db",
};

export function mergeConfig(userConfig) {
    return { ...DefaultConfig, ...userConfig };
}
