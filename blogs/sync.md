## sync包介绍

---

#### Go 语言的 sync 包提供了基础的同步原语，用于在多协程（goroutine）并发编程中进行资源共享控制，避免竞态条件。下面是 sync 包的几个核心组成部分介绍：  


主要包含以下几个具体功能：

| 工具          | 作用          | 特点         |
|-------------|-------------|------------|
| `Mutex`     | 互斥锁         | 一次只能一个协程访问 |
| `RWMutex`   | 读写锁         | 多读单写       |
| `WaitGroup` | 等待多个协程完成    | 常用于并发任务收尾  |
| `Once`      | 只执行一次的初始化逻辑 | 并发安全       |
| `Cond`      | 条件同步        | 高级场景       |
| `Map`       | 并发安全的 map   | 无需手动加锁     |


---

### Mutex

互斥锁，常用于一个公共资源的保护。  
假设在这个场景下：一千个goroutine同时取操作一个公共资源，很有可能会出现多个协程操作一个资源导致出现问题  
这时候就需要我们引入：互斥锁的概念，即：上锁时其他协程不许操作，等待解锁  
- 定义：var wg sync.WaitGroup/mu := sync.Mutex{}
- 加锁 wg.Lock()
- 解锁 wg.UnLock()
```
package main

import (
	"fmt"
	"sync"
)

var num = 0
var wg sync.WaitGroup

func Add(mu *sync.Mutex) {//定义，参数要是一个指针类型。不然锁就没用了
	mu.Lock()//加锁
	defer mu.Unlock()//defer是延迟到所在函数结束的时候
	num++
	fmt.Printf("Add: %d\n", num)

}
func main() {
	mu := sync.Mutex{}

	for i := 0; i < 100; i++ {
		go func() {
			wg.Add(1)
			defer wg.Done()
			Add(&mu)
		}()
	}
	wg.Wait()
}

```
- 关于锁传参为什么一定要传指针：如果不传递指针类型的话，就属于是值传递。这就会导致每一次传递的时候都是一个mu的拷贝，并不会真正起作用  
- defer，是延迟到所在函数结束之前再执行defer的语句。是栈结构：先defer的最后执行，最后defer的先执行  

### 读写锁

---

锁分为读锁和写锁
- 读锁：使用读锁加锁之后，该资源只能被读取，包括加锁的协程本身。此时不能写，任何协程都不行。
-  写锁：使用写锁加锁之后，只有该协程可以读写资源，其他协程不能读也不能写。

#### 使用教程
- 定义：var rw sync.RWMutex
- 加读锁：rw.RLock()
- 解读锁：rw.RUnlock()
- 加写锁：rw.Lock()
- 解写锁：rw.Unlock

假设我们有两个资源：  
a：负责存储原始数据  
b：用于计数或累加等写操作  
现在有一千个协程并发运行，它们的任务是：  
从资源 a 中读取数据（只读）  
调用资源 b 对数据进行累加处理（写操作）  
这时，为了保证并发安全，同时提高效率，我们应当这样加锁：  
对 资源 a 使用 读锁（RLock），因为多个协程可以同时读取，互不影响；  
对 资源 b 使用 写锁（Lock），因为累加操作涉及数据修改，必须保证同一时间只有一个协程在操作。    

### WaitGroup-等待组

---
sync.WaitGroup 用于等待一组 goroutine 执行完成，常用于主线程等待所有子协程任务结束。

#### 使用方法：
```
var wg sync.WaitGroup

wg.Add(1)         // 启动一个协程前调用
go func() {
defer wg.Done()  // 协程结束时调用
// 做一些事情
}()

wg.Wait()         // 等待所有协程结束
```

#### 特点：
Add(n)：添加等待数量

Done()：每个协程完成后调用

Wait()：主协程调用，阻塞直到所有 Done 调用结束




### Once

---

sync.Once 可以确保某个操作无论被调用多少次，只会执行一次，且是线程安全的。

使用方法：
```

var once sync.Once

func initConfig() {
	fmt.Println("初始化配置")
}

func main() {
	for i := 0; i < 10; i++ {
		go func() {
			once.Do(initConfig) // 只有一次会执行
		}()
	}
}

```
特点：
once.Do(f)：无论调用多少次，函数 f 只会被执行一次
### Cond

---

sync.Cond 是 Go 提供的一种条件变量，用于管理复杂的协程间通信，例如生产者-消费者模型。

#### 使用方法：
```

var locker = &sync.Mutex{}
var cond = sync.NewCond(locker)

func waitCondition() {
cond.L.Lock()
cond.Wait() // 等待通知
fmt.Println("被唤醒")
cond.L.Unlock()
}

func signalCondition() {
cond.L.Lock()
cond.Signal() // 或者 Broadcast() 广播唤醒所有等待者
cond.L.Unlock()
}
```
特点：
Wait()：当前协程等待并释放锁，直到被唤醒  
Signal()：唤醒一个等待协程  
Broadcast()：唤醒所有等待协程


### Map

sync.Map 是 Go 内置的并发安全 Map，适合读多写少的场景。

使用方法：
```

var m sync.Map

m.Store("key", 123)              // 写入
value, ok := m.Load("key")       // 读取
m.Delete("key")                  // 删除
m.Range(func(k, v any) bool {    // 遍历
fmt.Println(k, v)
return true
})
```
特点：
不需要加锁，读写安全  
适用于高并发读写场景  
相比内置 map + 锁，它性能更好、使用更简单，但不支持普通 map 操作（如 len、直接索引）

