## git 下载与使用

---

### 下载方法
**官方下载地址：https://git-scm.com/**  

访问后显示：

<img src="/imgs/git1.png" alt="Git 安装截图" width="1000" height="800">  

我们选择DownLoads，之后会显示

<img src="/imgs/git2.png" alt="Git 安装截图" width="1000" height="800">



之后我们选择合适的版本下载即可

---

下载之后运行下载下来的文件，然后根据指示完成安装（一直点next即可）。安装路径可以修改也可以默认

<img src="/imgs/git3.png" alt="Git 安装截图" width="500" height="400">

<img src="/imgs/git4.png" alt="Git 安装截图" width="500" height="400">

<img src="/imgs/git5.png" alt="Git 安装截图" width="500" height="400">

<img src="/imgs/git6.png" alt="Git 安装截图" width="500" height="400">

<img src="/imgs/git7.png" alt="Git 安装截图" width="500" height="400">

<img src="/imgs/git8.png" alt="Git 安装截图" width="500" height="400">

<img src="/imgs/git9.png" alt="Git 安装截图" width="500" height="400">

<img src="/imgs/git10.png" alt="Git 安装截图" width="500" height="400">

<img src="/imgs/git11.png" alt="Git 安装截图" width="500" height="400">

---

### 基本命令

安装完成之后的验证：win+r进入终端，输入 git version 如果输出对应版本号，即下载安装成功.
接下来我们就来了解以下git的基本操作
- 保存项目状态
- 拉取远程项目文件
- 把本地文件推送到远程仓库

---

git下载好之后我们首先要设置一个用户名和邮箱，对于这个操作设置的用户名和邮箱对真实性无要求。

`git config --global user.name "your name"`

`git config --global user.email "your email"`

设置成功后，我们后续的所有操作都会带上这俩信息。主要是不设置我们推送到远程的时候会报错    
<img src="/imgs/git12.png" alt="Git 安装截图" width="700" height="560">
这里就可以看到我们设置的username和email

#### 初始化仓库

git的大部分操作都是基于当前的地址，也就是当前所在目录。  
`git init`  
初始化仓库，在本地生成一个全新的，无污染的，未经使用的仓库  
有了仓库之后我们就可以把当前的项目的当前状态添加到暂存区  

`git add .  /  git add <文件>`  
添加目录下所有文件/添加指定文件到暂存区  

添加之后还需要有一个提交-commit `git commit -m "描述"`这样才算是一次完整的操作  

想要查看所有的提交，就需要使用 `git log`它会展示我们提交的记录  
<img src="/imgs/git13.png" alt="Git 安装截图" width="500" height="400">
黄色字体部分就是对应的hash值

#### 查看与恢复历史版本
查看某个历史提交
`git checkout 提交哈希值`

回到原分支：
`git checkout master`

恢复到某个提交（会丢失该提交之后的历史）
`git reset --hard 提交哈希值`

### 连接远程仓库 （github）

首先你要有一个仓库，打开仓库之后，点击绿色按钮，找到url  
<img src="/imgs/git14.png" alt="Git 安装截图" width="500" height="400">  
复制下来，然后
`git remote add NAME git@github.com:username/repo.git`这里面的NAME是自己起的名字  

查看是否连接成功：
`git status`连接成功会显示很多数据看到：Your branch is up to date with 'blog/main'.就说明成功了

`git branch -vv`可以查看分支的绑定情况  
比如这一段： 
---
PS C:\project\myblog> git branch -vv
* main bbfff03 [blog/main] 扩展  
---
意思就是本地的main绑定到了blog仓库的main  
如果一个分支只在本地仓库存在。推送到远程仓库的时候会新建一个对应的分支。但是不推荐这样操作哦  
更多的分支指令会再后续的分支部分讲到

### 分支
分支就像一颗树上的不同枝干，它们互相独立但是都有一根来连接（也就是项目）  
我们每一次提交的时候都会有记录，分支会在我们提交的时候指向最新的提交，像指针一样，我们查看历史提交的时候其实就是把分支指向向该提交  
我们可以根据当前的文件状态新建分支，新建的分支保存当前文件状态  

| 指令                                    | 作用        | 解释                                                                      |
|---------------------------------------|-----------|-------------------------------------------------------------------------|
| git branch                            | 查看所有分支    | 列出本地分支，并且会标气当前所处分支                                                      |
| git branch 分支名                        | 新建分支      | 新分支记录当前文件状态                                                             |
| git checkout 分支名                      | 切换分支      | 切换分支后文件状态也会改变为切换的分支                                                     |
| git switch 分支名                        | 切换分支      | 切换分支后文件状态也会改变为切换的分支                                                     |
| git checkout -b 分支名/git switch -c 分支名 | 创建并切换到新分支 |                                                                         |
| git merge 分支名                         | 合并分支      | 两个分支，保留修改的部分。如果同一文件都被修改需要人工选择                                           |
| git branch -d 分支名/git branch -D 分支名   | 删除分支      | 如果需要删除未合并分支，需要大写的参数D                                                    |
| git branch -m name                    | 修改分支名     | 把当前分支的名字修改掉                                                             |
| git branch -m a b                     | 修改分支名     | 把a分支的名字改为b                                                              |
| git push -u 仓库名 分支名                   | 推送分支      | 把当前所在地分支推送到远程仓库连接的对应分支上，-u参数的作用是绑定关系。也就是说这个指令调用一次之后后续再上传就可以直接使用git push |
| git reset --hard 提交哈希值                | 恢复到某一次提交  | 会损失这个提交之后的所有提交，文件也会恢复到提交记录状态                                            |

### 克隆 git clone
当我们有一个仓库的地址之后，就可以使用`git clone 仓库地址`克隆仓库内容到本地。  
假如说我再c盘根目录，克隆的内容就会在c的根目录