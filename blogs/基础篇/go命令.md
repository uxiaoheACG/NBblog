## GO命令

---
我们可以通过GO语言的原生命令来操作运行测试GO文件

---
### go run

自动编译并运行程序，不会生成二进制文件。
实例：
`go run main.go`

### go build / go build -o myapp.exe

打包程序，生成一个可执行的.exe文件

`go build` 会自动打包文件，生成一个名为test.exe的文件  
`go build -o myapp.exe`自动打包文件，生成的文件名自己指定，实例会输出一个myapp.exe文件

### go test

---
提示：测试文件必须要以_test.go结尾，测试的函数要以Test开头  
如Test_test.go文件内的 func TestAdd(num1,num2 int)int{}

---
测试用指令：
`go test`运行当前模块的所有测试
`go test -v`显示详细测试输出
`go test ./...`测试所有子包

### go install

用于安装可执行命令工具，存放在$GOBIN目录中（不存放在项目的目录，是全局目录）  
示例：    
`go install github.com/cosmtrek/air@latest`
具体的路径要取官方的网页看地址，@后面是版本。latest是默认的最新版本
### go mod tidy

项目中如果使用import导入第三方包之后，需要用go mod tidy整理项目依赖。这个是必要的，多运行几次也不会报错