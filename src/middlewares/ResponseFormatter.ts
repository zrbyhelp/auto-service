import { Request, Response, NextFunction } from 'express';

// 中间件函数
export const responseFormatter = (_req: Request, res: Response, next: NextFunction) => {
  // 用于包装响应数据的格式
  res.success =<T>(data: T) => {
    res.json({ success: true, data});
  };

  res.error = (message: string) => {
    res.status(200).json({ success: false, message });
  };
  next();
};
