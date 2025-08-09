## net/http包介绍

---

net/http包是所有web框架的基础，其它的web架构大多是由该包发展更新而来  
网络编程的本质就是在后端实现一个服务器，这个服务器实现监听网络请求的操作。根据不同的网络请求返回对应的数据  


---
创建并开启服务器：
```
err := http.ListenAndServe("ip:port", nil)//参数说明在下面
if err != nil {
    panic("err")
}
```
ip:port：监听的地址和端口，例如：

- ":8080"：监听所有网卡上的 8080 端口（最常见）
- "127.0.0.1:8080"：只监听本地回环地址（只有本机能访问）
- "192.168.1.100:8000"：监听指定局域网 IP
- nil：表示使用默认的路由器 http.DefaultServeMux

### 创建全新的路由器
```
mux := http.NewServeMux()//创建新的路由器

mux.HandleFunc("/",处理函数)//路由器绑定路由以及处理函数

err := http:ListenAndServe("ip:port",mux)
if err != nil{
    panic("err")
}
```

### 处理函数
标准写法：
```
func Fn(w http.ResponseWriter, r *http.Request){
    w是响应回前端的时候用到的
    r是接收到的请求的内容，包括请求体，url，参数、表单、请求头这些
}
```
基本用法：
```
func main() {
	mux := http.NewServeMux()//新建路由
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {//判断方法是否是post。http.Method Post/Get/Delete/Put
			http.Error(w, "只支持 POST 请求", http.StatusMethodNotAllowed)
			return
		}

		// 解析表单参数
		err := r.ParseForm()//先解析表单，才能获取表单值
		if err != nil {
			http.Error(w, "参数解析失败", http.StatusBadRequest)
			return
		}

		username := r.FormValue("username")//获取表单值
		password := r.FormValue("password")

		// 构建返回数据
		response := map[string]interface{}{//创建一个map或者结构体，存放值
			"code":     0,
			"message":  "登录成功",
			"username": username,
			"password": password, // 实际项目中不建议回传密码
		}

		// 设置响应头为 JSON
		w.Header().Set("Content-Type", "application/json")

		// 将数据编码为 JSON 并返回
		err = json.NewEncoder(w).Encode(response)//把map转换为json数据放入w，放入后会自动返回
		if err != nil {
			return
		}
	})
}
```

不止有map可以转换为json。struct也可以转换为json，这两个是最常用的  
struct转json示例：
```
type User struct {
    Username string `json:"username"`//转换为json之后key值就是username
    Password string `json:"password"`
}

user := User{Username: "alice", Password: "123456"}
json.NewEncoder(w).Encode(user)

```

### 请求的属性

#### url query 参数查询
`https://www.xxx.com?username=xxx&password=123`这是一个标准的query查询，一个完整的url后面跟着参数，
从？开始表示后续的字符是参数，格式为 `key=value`多个参数用&连接

#### 路径传参
`https://www.xxx.com/xxx/123` 这是一个路径传参，即参数写在路径中。通常需要结合框架使用。是标准的RESTful API风格
通常的路由设置为：
```
//这是gin框架
r.GET("/user/:id", func(c *gin.Context) {
    id := c.Param("id") // 获取路径参数
})
//并且支持一条路由传递多个参数
/user/:id/:password
获取方法同上
```

#### 表单传参
```
<form method="POST" action="/login">
  <input name="username">
  <input name="password">
</form>
//这是一个经典的表单传参
```
在GO的net/http包中，需要先解析表单 `r.ParseForm()`，表单解析后才能获取表单的值 `username := r.FormValue("username")`

#### json请求体
前端可以通过fetch/axios传递json数据  
```
{
  "username": "alice",
  "password": "123"
}
//json数据是经典的一个key对应一个value数据
```
对于我们的后端而言，我们需要一个结构体来接收这个数据，根据上述的json数据我们写出了以下结构体：  
```
type User struct{
    Username string `json:username`
    Password string `json:password`
}
```
这里我们用到了一个叫做字段描述的功能，即User的Username字段对应一个key值为username的json数据

#### Header参数（请求头）
Header参数常用于做鉴权，即判定是否存在权限访问某某网页。简单来说就是我们登录一个网站之后，网站会给我们一个令牌。只有携带这个令牌的请求才会被后端正确的接收  
后端获取Header参数：
`token := r.Header.Get("key")`请求头也是键值对的形式存在

#### Cookie参数
Cookie参数一般是登陆的时候后台自动分配的，前端的请求会自动携带这个参数。功能是鉴权、判断用户  
后端获取Cookie：
`cookie,err := r.Cookie("CookieName")`也是键值对存在
### r *http.Request的字段与属性介绍

字段介绍，不是方法：  

| 字段名             | 类型                | 说明                                                 |
|-----------------|-------------------|----------------------------------------------------|
| `Method`        | `string`          | 请求方法（如 GET、POST、PUT 等）                             |
| `URL`           | `*url.URL`        | 请求的 URL（包含路径、参数等）                                  |
| `Header`        | `http.Header`     | 请求头，是一个 map\[string]\[]string                      |
| `Body`          | `io.ReadCloser`   | 请求体，通常用于 POST/PUT 的数据读取                            |
| `ContentLength` | `int64`           | 请求体长度（字节数）                                         |
| `Host`          | `string`          | 请求的主机名                                             |
| `RemoteAddr`    | `string`          | 客户端 IP + 端口                                        |
| `Form`          | `url.Values`      | 所有表单数据（需调用 `ParseForm()` 或 `ParseMultipartForm()`） |
| `PostForm`      | `url.Values`      | POST 表单中的数据（需调用 `ParseForm()`）                     |
| `MultipartForm` | `*multipart.Form` | 多部分表单数据（上传文件等）                                     |
| `Cookie`        | `[]*http.Cookie`  | Cookie 信息                                          |
| `Proto`         | `string`          | 协议版本，如 HTTP/1.1                                    |

#### 方法介绍：

#### 1. `r.ParseForm() error`

解析 URL 中的 query 和 body 中的表单数据（包括 POST 和 GET）。  
**必须调用后，才能使用 `r.Form`、`r.PostForm` 获取表单字段值。**

```go
err := r.ParseForm()
if err != nil {
    http.Error(w, "ParseForm error", http.StatusBadRequest)
    return
}
username := r.Form.Get("username")
```
#### 2.`r.ParseMultipartForm(maxMemory int64) error`
解析 multipart/form-data 表单（用于文件上传）。
maxMemory 指定内存使用上限，超过部分写入临时文件。 
```
err := r.ParseMultipartForm(32 << 20) // 32MB
if err != nil {
    log.Println("Upload parse error:", err)
}
file, handler, err := r.FormFile("uploadfile")

```

#### 3.`r.FormValue(key string) string`
快速获取表单中字段值（无论是 URL 查询参数还是 POST 表单字段）。
无需调用 ParseForm()，但返回值始终是 string 类型。
```
username := r.FormValue("username")
```

#### 4.`r.PostFormValue(key string) string`
只获取 POST 表单中的字段值（忽略 URL 查询参数）。
同样不需要手动调用 ParseForm()。
`password := r.PostFormValue("password")`

#### 5.`r.URL.Query() url.Values`
获取 URL 中的查询参数（仅适用于 GET 请求中的 ?key=value）。
`query := r.URL.Query().Get("search")
`

#### 6.`r.Cookie(name string) (*http.Cookie, error)`
获取单个 Cookie 对象。
```
cookie, err := r.Cookie("session_id")
if err != nil {
    // Cookie 不存在或读取失败
}

```
#### 7.`r.UserAgent() string`
获取请求头中的 User-Agent（客户端信息）。
`ua := r.UserAgent()`

#### 8.`r.Referer() string`
获取请求来源（即 Referer 头）。
`ref := r.Referer()
`

### w http.ResponseWriter字段与属性介绍
**核心接口定义**
```
type ResponseWriter interface {
Header() http.Header              // 设置响应头
Write([]byte) (int, error)        // 写响应体内容
WriteHeader(statusCode int)       // 写状态码（只能调用一次）
}
```

#### 扩展功能（接口断言）

标准库中的 http.ResponseWriter 实现类型在运行时可能支持以下接口，需通过类型断言使用：

1. http.Flusher —— 手动刷新数据到客户端
```
type Flusher interface {
Flush()
}
```
用法示例：
```
if f, ok := w.(http.Flusher); ok {
f.Flush()
}
```
2. http.Hijacker —— 获取底层连接（常用于 WebSocket、HTTP 协议升级）
```
type Hijacker interface {
Hijack() (net.Conn, *bufio.ReadWriter, error)
}
```
3. http.Pusher —— HTTP/2 推送资源
```
type Pusher interface {
Push(target string, opts *PushOptions) error
}
```
常用方法示例

小结

http.ResponseWriter 是 HTTP 响应的关键接口。

除了核心方法，还可以支持扩展协议和高级功能。

多用于 API 接口、文件下载、流式输出、WebSocket 等场景。

建议熟悉其基本用法，复杂场景时灵活使用接口断言能力。