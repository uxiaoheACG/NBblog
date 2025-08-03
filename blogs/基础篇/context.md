## context包介绍

---

context包的主要作用是上下文操作、协程控制

---

context的基本方法：
```
type Context interface {
    Deadline() (deadline time.Time, ok bool)
    Done() <-chan struct{}
    Err() error
    Value(key any) any
}
```
- context是一个接口类型，当作参数传递的时候不用指针
- Deadline()返回context的截止时间
- Done()返回一个channel，再context被取消或超时后关闭
- Value(key)从context中取出键值对数据，这里是泛型可以传递任何数据
- Err()返回context被取消的原因

---
### 常用函数与使用方法

#### 创建context
context的根创建：
```
//创建一个空context作为context树的根。可以理解为最基础的最不可或缺的部分
ctx := context.Background()

//创建一个尚且不知道上下文处理逻辑的占位符,基本上不用
ctx := context.TODO()
```
#### 给context添加值-context.WithValue(ctx,key,value)
```
//创建空上下文
ctx := context.Background()

//添加值，值的类型是any，也就是啥都可以塞进去
context.WithValue(ctx,"key","value")

//获取值
ctx.Value("key")//要有遍历承接值哦
```

#### 根据根派生出的context.WithCancel(Parent context)：
```
//我们已经创建好了一个空的上下文
ctx := context.Background()
//根据根context建立一个新的context，并获得一个函数，调用函数之后ctx就可以通过<-ctx.Done()获取一个参数
ctx,cancel := context.WithCancel(ctx)

//使用实例：
func main() {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel() // 最好写上，防止资源泄露

	go func(ctx context.Context) {
		select {
		case <-ctx.Done():
			fmt.Println("任务被取消")
		}
	}(ctx)

	// 手动取消
	cancel()
	time.Sleep(3 * time.Second)
	fmt.Println("主程序结束")
}

//这是一个最基础的实现
```
接下来会有一个真正实现的例子：
```

func main() {
	ctx := context.Background()
	ctx, cancel := context.WithCancel(ctx)//创建具有关闭控制的ctx

	go func() {//创建一个协程，当超过六秒之后关闭对应携程
		time.Sleep(6 * time.Second)
		cancel()
	}()
	userName := GetUser(ctx)//调用函数

	fmt.Println(userName)
}
func GetUser(ctx context.Context) string {//最终返回username

	ch := make(chan string)//创建一个无缓冲通道
	go func() {//启动一个协程用于调用业务逻辑函数，并且吧返回值塞入通道
		ch <- FilName()
	}()

	select {//监听两个通道。一个是关闭的一个是获取到username的
	case <-ctx.Done():
		return "done"
	case msg := <-ch:
		return msg
	}
}
func FilName() string {//真正的业务逻辑单独的封装
	time.Sleep(5 * time.Second)//等待五秒，小于我们规定的超时时间
	return "FileName"
}

```

总结：  
我们使用 context.WithCancel(context.Background()) 创建了一个可取消的 Context。这个 Context 提供的 ctx.Done() 方法返回一个只读通道 <-chan struct{}。

- 在 cancel() 函数调用前，这个通道是阻塞的；
- 一旦调用 cancel()，内部会执行 close(chan)，关闭通道；
- 所有监听 <-ctx.Done() 的 goroutine 会因为通道关闭而立即取消阻塞；
- 这是一个广播机制，所有监听者都会感知到取消事件。

#### 根据根派生出的context.WithTimeout(Parent context)：

在上一个context.WithCancel()里我们学到的是手动关闭一个协程。在接下来我们会学习超时自动关闭  
使用实例：
```
//创建一个空的上下文
ctx := context.Background()
//创建具有超时的context
ctx,cancel := context.WithTimeout(ctx,time)//这里的time是自己设定的时间
//这里也会返回一个函数用于手动结束，这个是必要的。因为不用这个可能会导致不可预料的数据泄露  

```
运用实例：
```

func main() {
	ctx := context.Background()

	ctx, cancelTimeOut := context.WithTimeout(ctx, 6*time.Second)//设置六秒超时
	defer cancelTimeOut()//等主程序结束就释放资源

	userName := GetUser(ctx)

	fmt.Println(userName)
}
func GetUser(ctx context.Context) string {

	ch := make(chan string)
	go func() {
		ch <- FilName()
	}()

	select {
	case <-ctx.Done():
		return "done"
	case msg := <-ch:
		return msg
	}
}
func FilName() string {
	time.Sleep(5 * time.Second)//逻辑操作是五秒
	return "FileName"
}

```
总结：  
无论是withcancel还是timeout 控制方法都是建通ctx.Done() 两者的区别是一个会自动超时关闭，一个需要手动关闭  


#### 截止时间控制，根据context派生出的context.WithDeadline(parent ctx,deadline)

这个和超时机制差不多。唯一的区别是：
```
deadline := time.Now().Add(5 * time.Second)
//意思是deadline是当前时间后五秒时间自动关闭
ctx, cancel := context.WithDeadline(context.Background(), deadline)
```
其它的操作都是和前面两个一样。都是监听ctx.Done()返回的通道

---

### 最后总结：
我总结了一个模板，用于上面三种方法
```
func main(){//主程序，用于开启

}

func Controller(ctx context.Context){//控制函数，用于调用业务逻辑和关闭协程.返回最终数据
    ch := make(chan any)//定义通道
    go func(){
        ch<-Work()
    }()
    select{
        case <-ctx.done():
            return 空值,错误信息
        case msg:=<-ch:
            return msg.nil//返回数据和无错误信号
    }

}
func Work() any {//实际的工作，有或者没有返回值

}
```