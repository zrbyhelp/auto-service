// globalMethods.ts

function isDevelopmentEnvironment(): boolean {
    return process.env.NODE_ENV === 'development';
}
function getDevelopmentEnvironmentText(): string {
    return isDevelopmentEnvironment()?"开发环境":"生产环境";
}
// 将方法添加到全局对象
global.isDevelopmentEnvironment = isDevelopmentEnvironment;
global.getDevelopmentEnvironmentText = getDevelopmentEnvironmentText;