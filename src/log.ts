import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import fs from 'fs';
import expressWinston from 'express-winston';

const logDirError = 'logs/error';

if (!fs.existsSync(logDirError)) {
    fs.mkdirSync(logDirError, { recursive: true });
}
const logDir = 'logs/info';
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}
const logFormat = winston.format.printf(({ timestamp, level, message ,host}) => {
    return `${timestamp} ${level} : ${message} \r\n ${host}`;
  });
export const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      logFormat
    ),
    transports: [
        new DailyRotateFile({
            filename: 'logs/info/%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m', // 日志文件最大大小
            maxFiles: '730d', // 最多保留两年的日志文件
        }),
    ],
  });
export const errorLog =  winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      logFormat
    ),
    transports: [
        new DailyRotateFile({
            filename: 'logs/error/%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '400m', // 日志文件最大大小
            maxFiles: '2y', // 最多保留两年的日志文件
        }),
    ],
  });
 export default () => expressWinston.logger({
  winstonInstance: logger,
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.json()
  ),
});