## gorm

---

这是一个外部的包，使用之前需要先导入：gorm.io/gorm  
它的作用是操作数据库  
在orm中，一个结构体对应一个数据库的表。  

---

### gorm连接数据库

---
```
	dsn := "root:123456@tcp(127.0.0.1:3306)/datasss?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})//连接

	if err != nil {//判断错误
		panic("failed to connect database")
	}
```

dsn的格式是：`username:password@协议(ip:port)/database?其余参数` 

打开数据库之后通常是需要我们进行结构体对表的映射的  `db.AutoMigrate(&User{}, &Company{})`使用AutoMigrate进行迁移  
注意：数据库已有的表不会改变，可以添加额外字段但是不可以删除多余字段  

### 增删改查  

---

增  
```
// 插入一条记录
user := User{Username: "app", Password: "123456", CompanyID: 1}
db.Create(&user)

// 插入多条记录
users := []User{
    {Username: "tom", Password: "123"},
    {Username: "jerry", Password: "456"},
}
db.Create(&users)

// 指定字段插入（忽略零值）
db.Select("Username", "Password").Create(&User{
    Username: "alpha",
    Password: "654321",
})

```

查询   
```
var user User

// 按主键查询
db.First(&user, 1) // SELECT * FROM users WHERE id = 1 LIMIT 1

// 条件查询
db.Where("username = ?", "app").First(&user)
db.Where("username LIKE ?", "%pp%").Find(&[]User{})

// 多条件
db.Where("username = ? AND password = ?", "app", "123456").Find(&[]User{})

// 排序 + 限制
db.Order("id desc").Limit(5).Find(&[]User{})

```

改  
```
// 更新单个字段
db.Model(&User{}).Where("id = ?", 1).Update("password", "newpass")

// 更新多个字段
db.Model(&User{}).Where("id = ?", 1).Updates(User{
    Username: "newname",
    Password: "newpass",
})

// 用 map 更新（不会忽略零值）
db.Model(&User{}).Where("id = ?", 1).Updates(map[string]interface{}{
    "username": "mapname",
    "password": "mappass",
})

```

删  
```
// 按主键删除
db.Delete(&User{}, 1)

// 条件删除
db.Where("username = ?", "app").Delete(&User{})

如果 User 里有 gorm.Model，Delete 是 软删除（只更新 deleted_at 字段）
完整且真实的删除要用↓
db.Unscoped().Delete(&User{}, 1)

```

### 表的关联插入  

---

结构体声明格式：  
```
type User struct {
	gorm.Model
	Username  string `gorm:"unique;column:username;not null"`
	Password  string `gorm:"column:password;unique;not null"`
	CompanyID int    `gorm:"column:company_id;not null"`//在表中会显示，显示为关联的company的id
	Company   Company//在表中不会显示出来
}
type Company struct {
	gorm.Model
	Name string `gorm:"column:name;not null"`
}
一个company可以对应多个user，一个user只能对应一个company

```
也可以用别的字段作为绑定，但是要写好声明
假如说我想绑定公司的Name，这时候就需要在`Company Company`后面加一个字段描述`gorm:"foreignKey:CompanyID;references:Name"`意思是让User的CompanyID与Company的Name绑定  
这个CompanyID就是外键
### 关联查询Preload

---

如果在查询的过程中，查询了有关联插入的表，我们不能查询到具体的关联的数据。也就是说在上面的情况下，我们只能查询User和User存储的CompanyID，Company是没有数据的  
因为在执行查询语句的时候sql语句是只查询了user表。这时候我们就需要预加载  
格式如下：  
```
db.Preload("Company").First(&user)//这样查询就会获取到user关联的Company的数据
```

预加载的示例：
```
package main

import (
	"fmt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Username  string `gorm:"unique;column:username;not null"`
	Password  string `gorm:"column:password;unique;not null"`
	CompanyID int    `gorm:"column:company_id;not null"`
	Company   Company
}
type Company struct {
	gorm.Model
	Name string `gorm:"column:name;not null"`
}

func main() {
	dsn := "root:123456@tcp(127.0.0.1:3306)/datasss?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})

	if err != nil {
		panic("failed to connect database")
	}

	db.AutoMigrate(&User{}, &Company{})
	company := Company{
		Name: "companyName",
	}
	db.Create(&company) //创建公司
	var users []User    //用切片存储多个数据

	users = append(users, User{
		Username: "username",
		Password: "password",
		Company:  company,
	})
	users = append(users, User{
		Username: "username2",
		Password: "password2",
		Company:  company,
	}) //添加数据

	db.Create(&users)
	//存储数据完成
	//查询数据
	var user User
	db.Where("username = ?", "username2").First(&user)
	fmt.Println("不用预加载查询结果，username：", user.Username, "  user.company.Name:", user.Company.Name)
	var user2 User
	db.Preload("Company").Where("username = ?", "username2").First(&user2)
	fmt.Println("预加载查询结果，username：", user2.Username, "  user.company.Name:", user2.Company.Name)

}

```