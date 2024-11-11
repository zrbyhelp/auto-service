export type version =  "0.0.1" | "0.0.2" ;
//版本注册
const versions:Version[] = [
    {message:"初始化版本",value:"0.0.1"}
];
export interface Version {
    message: string;
    value: version; 
}
export  {versions} ;