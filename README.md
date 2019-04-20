SDWC == S Dashboard Web Console
=====
[![Build Status](https://travis-ci.org/SB-IM/SDWC.svg?branch=master)](https://travis-ci.org/SB-IM/SDWC)

> Multiple drones and ground station Web consoles
>
> element-ui + vue.js + axios + vuex + vue-router + vue-i18n
>
> SDWC is SuperDock Web Console v3.0

![SDWC-demo](doc/SDWC-v3.gif)

## Introduction
>The program developed by the SBIM (StrawBerry Tech) and MPL-2.0 protocol open source, the goal is to do a general-purpose console

## Build Setup

``` bash
# install dependencies
yarn install

# serve with hot reload at localhost:8080
yarn run dev

# build for production with minification
yarn run build
```

## Install && Config

```bash
cp src/config.json ./

vim config.json

```

## Packaged as a client
```sh
P=linux64 yarn client

# P = ['win32', 'win64', 'osx32', 'osx64', 'linux32', 'linux64']
```

### ××××× Important! ! ! !

>The program launches the config.json configuration file for the default load /config.json

>If you do not find the file, the default Kai file to load the data under the samples directory (local data)

>This will enable local debug account

>user: debug
>
>pass: debug


### Lifecycle Async Resource Load
1. load config.json
2. auth user [post && get]
3. get nodes list
4. get node detail && link node

## Composing with Components Relation Diagram
* app
  - login
  - dashboard
    - header
    - sidemenu
    - tabs
      - context

##### Default context components
context
- air
  - rt-monitor
  - ws-dbus
    - uavtrack
    - uavstatus
    - socketTerminal
- depot
  - rt-monitor
  - httpTerminal

## Update Log

year month day
- 2018.0124
  - start_public
- 2018.0129
  - add node video type
  - add video type flv
- 2018.0130
  - rename type to type_name
- 2018.0205
  - add oauth 2.0 type: password
- 2018.0229
  - Use travis-ci
- 2018.0304
  - Add hls.js
  - Add vue-i18n
- 2018.0316
  - Add nw-build
- 2018.0421
  - Add uavtrack
- 2018.0712
  - Add httpTerminal
- 2018.0723
  - Add BaseTerminal
  - Add socketTerminal
  - Add ws-dbus
  - Add dbus uav_status lib
  - Add uavStatus
  - Add weather
- 2018.1226
  - Delete console_ws
- 2019.0330
  - Add mqtt
- 2019.0420
  - Add webrtc

## Todo List
- [x] English Docs
- [x] add flv.js
- [x] add hls.js
- [x] mavlink components
- [x] Add vue-i18n

## 中文文档

本程序由草莓科技开发并开源，以MPL-2.0协议开源，目地是想做一个通用型控制台

使用 vue 全家桶 + element-ui + axios.js 开发

可以实现同时控制多台设备

有些东西不知道如何中描述～ (￣∇￣) ～ 请参上面的英文文档


> 本程序属于云控制系统的一部分，可单独使用。并具有良好的扩展性。易于二次开发
>
> 大疆司空应该算竞品了～ (￣∇￣) ～  大言不惭的说  ：）逃。


## 打包成客户端
```sh
P=linux64 yarn client

# P = ['win32', 'win64', 'osx32', 'osx64', 'linux32', 'linux64']
```

##### 程序框架父子组件关系图

* app
  - login
  - dashboard
    - header
    - sidemenu
    - tabs
      - context

## ××××× 重要！！！！

为了国际化，默认语言为英文。需要设置成中文

vim src/main.js
```JavaScript
const i18n = new VueI18n({
    locale: 'zh',  // Change Language
    messages: {
        'zh': require('./lang/zh'),
        'en': require('./lang/en')
    }
})
```

程序启动默认加载 / 目录下的 config.json 配置文件

```
cp src/config.json ./

```

如果没找到文件，默认启本文件加载 samples 目录下的数据（本地数据）

这样可以启用本地调试账号

> user: debug
>
> pass: debug

## 关于token 认证
支持两种认证方式：
在url里埋token方式

1. 在suffix 变量里设置好token变量名
2. 在login 返回json 中设置 url_token 参数为 true
3. token 值会自动加在 suffix 后面，每次请求会自动添加token

还支持oauth2.0 password 模式认证


### 生命周期异步资源加载过程
1. load config.json
2. auth user (post|get)
3. get nodes list
4. get node detail && link node

### 目录模块

##### samples
提供本地数据，异步请求数据样本

##### contexts
内容模目录

提供两个内容模型
- contexts
  - air
  - depot

调用 components 里模块

##### components
功能组件
- components
  - webterminal
    - command.json
  - monitor-img

## 远程控制无人机
[API Doc](doc/mqtt_doc.md)

### old
old 目录下的是 2.0 版本程序 （已废弃）可以拿来做参考（如电源模块）～ (・∀・) ～

![SDWC-2-old-demo](doc/SDWC-v2.gif)

v1.0 版 （已无参价值）

![SDWC-1-old-demo](doc/SDWC-v1.jpg)
