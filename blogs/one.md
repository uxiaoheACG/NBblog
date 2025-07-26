# Go 语言基础入门教程

Go（又称 Golang）是一种由 Google 开发的开源编程语言，以并发、高性能、部署简单著称，非常适合后端开发、网络编程、微服务等领域。

---

## 📥 一、下载安装 Go

### ✅ 官方下载地址

👉 [https://go.dev/dl/](https://go.dev/dl/)

根据你的操作系统选择对应版本：

- **Windows**：`go1.xx.x.windows-amd64.msi`
- **macOS**：`go1.xx.x.darwin-amd64.pkg` 或 `arm64.pkg`
- **Linux**：`.tar.gz` 格式压缩包

---

## 🛠 二、配置环境变量（以 Windows 为例）

### 1. 安装路径（默认）

C:\Program Files\Go



### 2. 设置系统环境变量

打开方法：

> 右键【此电脑】 → 属性 → 高级系统设置 → 环境变量

在系统变量中：

- 找到并编辑 `Path`，添加一项：

C:\Program Files\Go\bin


- 新建一个用户变量 `GOPATH`，指向你的工作目录，例如：

D:\GoWork



### 3. 验证安装

打开终端（CMD 或 PowerShell）执行：

```bash
go version
输出示例：
go version go1.21.1 windows/amd64
```
### 4. 第一个go代码
```
    package main
    
    import "fmt"
    
    func main(){
        fmt.Println("hello word!")
    }
```

输出实例：hello word
