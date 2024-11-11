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

//初始化环境变量
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
dotenv.config({ path: `.env` });
console.log(colors.blue('[ZR] 当前运行环境:%s'),getDevelopmentEnvironmentText());
console.log(colors.blue('[ZR] 当前程序端口:%s'),process.env.port);
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

app.listen(process.env.port, () => {
    console.log(colors.blue('[ZR] 程序已经启动'));
    console.log(colors.blue('[ZR] http://localhost:%s/%s/%s'),process.env.port,process.env.name,versions[versions.length-1].value);
})