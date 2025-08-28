## consul 微服务注册

---

下载 ：https://developer.hashicorp.com/consul/install  
下载完成后是一个压缩包，解压之后是一个exe文件。在该文件所在目录下执行`consul --version`即可查看版本。  
可以把它注册到环境变量  
使用 ` cansul agent -dev`运行，访问`localhost:8500`就可以看到对应的ui  

---

### go微服务注册到consul

在此之前我们已经获取到的信息有：cansul的运行ip端口（localhost:8500），微服务监听的ip端口（假设是localhost:9998）

我们只需要调用以下代码即可完成注册

```
func registerToConsul() error {
	// 创建 Consul 客户端配置
	config := api.DefaultConfig()
	config.Address = "127.0.0.1:8500" // Consul HTTP 地址
	client, err := api.NewClient(config)
	if err != nil {
		return err
	}

	// 定义服务注册信息
	registration := &api.AgentServiceRegistration{
		ID:      "rpcA-service-2", // 服务唯一 ID
		Name:    "rpcA-service",   // 服务名 多个rpc服务器可以属于同一个服务，但是它们的id必须是唯一的。不可以重复的
		Address: "127.0.0.1",      // 服务 IP
		Port:    9998,             // gRPC 服务端口
		Check: &api.AgentServiceCheck{ // 健康检查
			TCP:                            "localhost:9998", // gRPC 地址
			Interval:                       "5s",             // 健康检查间隔
			Timeout:                        "2s",
			DeregisterCriticalServiceAfter: "15s",
		},
	}

	return client.Agent().ServiceRegister(registration)
}

```

服务端注册好之后我们可以在cansul的ui中看到对应的实例  

### 客户端从consul中获取到微服务的ip:port

```
	// 1. 创建 Consul 客户端
	client, err := api.NewClient(&api.Config{
		Address: "127.0.0.1:8500", // Consul HTTP 地址也就是cansul运行的ip和端口
	})
	if err != nil {
		log.Fatal(err)
	}

	// 2. 查询服务列表
	services, _, err := client.Health().Service("rpcA-service", "", true, nil)//rpcA-service就是我们注册到服务的name，我们只需要服务的name就可以申请对应的port和ip
	
	if err != nil {
		log.Fatal(err)
	}

	if len(services) == 0 {
		log.Fatal("No available service found")
	}

	// 3. 取第一个可用服务
	svc := services[0].Service
	fmt.Println("获取到的服务数量", len(services))
	address := fmt.Sprintf("%s:%d", svc.Address, svc.Port)
	fmt.Println("Connecting to:", address)//这个address就是我们申请到的服务的ip和端口

```