import "express-async-errors"
import dotenv from 'dotenv';
import colors from 'colors';
import "./unit/globalMethods"
import express from 'express';
import cors from 'cors';
import { versions } from './version';
import { responseFormatter } from "./middlewares/ResponseFormatter";
import { ZrError, errorUse } from './zrError';
import router from './routes';
import Consul from 'consul';
import os from 'os';
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const interfaceName in interfaces) {
      const ifaceList = interfaces[interfaceName];
      if (ifaceList) { // 添加空值检查
          for (const iface of ifaceList) {
              // 过滤IPv4地址和非回环地址
              if (iface.family === 'IPv4' && !iface.internal) {
                ips.push(iface.address) ;
              }
          }
      }
  }
  return ips; 
}

//初始化环境变量
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
dotenv.config({ path: `.env` });
const port = parseInt(process.env.port || "3000");
const host = process.env.host || "127.0.0.1";
const consulIp = process.env.consulIp || "127.0.0.1"
const serviceName = process.env.serviceName||"noneservice"
const consulProt = parseInt(process.env.consulProt || "8500");
console.log(colors.blue('[ZR] 当前运行环境:%s'),getDevelopmentEnvironmentText());
console.log(colors.blue('[ZR] 当前程序端口:%s'),port);
console.log(colors.blue('[ZR] 程序启动中...'));

const app = express();

//解决跨域
app.use(cors());
app.all('*', function (_req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "content-type");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("Access-Control-Expose-Headers", "Authorization"); 
    res.header("X-Powered-By", ' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
})

//中间件 处理json
app.use(express.json());
//响应格式化中间件
app.use(responseFormatter);

//健康检查
app.get('/health', (_req, res) => {
  res.send('OK');
});

// 服务注册到Consul
const consul = new Consul({
  host: consulIp,
  port: consulProt
});
consul.agent.service.register({
  token: process.env.consulToken,
  name: serviceName,
  address: process.env.LBHost, 
  port:parseInt(process.env.LBPort|| "80"),
  tags: ['通用服务'],
  id: `${serviceName}_${host}_${port}`,
  check: {
      name: 'Health Check',
      http: `http://${host}:${port}/health`, // 健康检查的地址
      interval: '6s', // 每10秒检查一次
      timeout: '3s'
  }
}).then(() =>{
  console.log(colors.blue('[ZR] 服务注册成功'))
}).catch(err => {
  console.log(colors.red('[ZR] 服务注册失败'),err.message)
})

//版本控制中间件
app.use(`/${process.env.name}/:version`, (req, _res, next) => {
  const v = req.params.version;
  const foundVersion = versions.find((version) => version.value === v);
  if (!foundVersion) {
    throw new ZrError("未找到符合条件的版本");
  }
  app.set("v", foundVersion);
  next();
});


//路由
app.use(`/${process.env.name}/:version`,router);

//错误处理中间件
app.use(errorUse);

app.listen(port, () => {
    console.log(colors.blue('[ZR] 程序已经启动'));
    getLocalIP().forEach(item=>{
      console.log(colors.blue('[ZR] http://%s:%s/%s/%s'),item,port,process.env.name,versions[versions.length-1].value);
    })
    console.log(colors.blue('[ZR] 负载均衡 %s:%s/%s/%s'),process.env.LBHost,process.env.LBPort,process.env.name,versions[versions.length-1].value);
    console.log(colors.blue('[ZR] 本地连接 http://localhost:%s/%s/%s'),port,process.env.name,versions[versions.length-1].value);
})