### docker安装consul集群
```
    docker run -d --name=consul -v C:\path\to\your\config.json:/consul/config/config.json -p 8500:8500 -p 8600:8600/udp consul:1.15.4 agent -config-file=/consul/config/config.json  -dev -client=0.0.0.0 -ui
```