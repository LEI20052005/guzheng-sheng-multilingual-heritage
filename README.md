# 声生不息 · 古筝与笙的多语种数字传承计划

> 梳理民乐源流，留存传世音律 —— 一个聚焦 **古筝** 与 **笙** 两大中国传统乐器的数字资料库网站。
> 全栈实践项目：原生前端 + Spring Boot 后端 + MySQL 数据库。

---

## 🏗️ 项目亮点

- **前后端分离架构**：前端 `fetch` → REST API → Spring Boot → MyBatis → MySQL
- **用户认证体系**：JWT Token 认证 + BCrypt 密码加密（老密码自动升级）
- **后端分页**：留言墙按赞数/语言分页加载，接口返回统一分页结构
- **点赞防重复**：`(message_id, user_id)` 联合主键 + 事务，赞/取消赞原子操作
- **管理员系统**：拉黑（封禁）任意账号、删除任意留言，被封禁账号登录被拒
- **工程化规范**：统一响应结构 `Result{code,message,data}`、全局异常处理、`@Valid` 参数校验
- **3D 可视化**：Three.js 加载 GLB 模型，旋转/缩放交互

---

## ✨ 功能板块

| 板块 | 说明 |
| --- | --- |
| 首页 | 项目简介与快速导航 |
| 乐器资料库 | 古筝 / 笙的历史、形制、音色、名家与经典曲目 |
| 经典曲目库 | 《高山流水》《广陵散》《冬猎》《晋调》赏析与在线试听 |
| 视频展厅 | 高清演奏视频 |
| 建模展示 | Three.js 乐器 3D 模型交互（可旋转缩放） |
| 互动答题 | 「丝竹寻音」知识问答，中英双语，称号挑战 |
| 多语言 | 全站中文 / 英文一键切换 |
| **多语种留言墙** | 用户注册/登录后留言（中文/英文），点赞排行，分页加载，删除自己的留言 |
| **管理后台** | 管理员登录后可查看用户列表、拉黑账号、删除任意留言 |

---

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────┐
│  浏览器（index.html，原生 JavaScript + fetch）            │
│  登录 → 获取 JWT → 携带 Authorization 请求业务接口         │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP / JSON
┌──────────────────────────▼──────────────────────────────┐
│  Spring Boot 3.3.1（backend/）                           │
│  Controller → Service（事务） → Mapper（MyBatis）         │
│  JWT 拦截鉴权 / 全局异常处理 / 统一 Result 响应            │
└──────────────────────────┬──────────────────────────────┘
                           │ SQL
┌──────────────────────────▼──────────────────────────────┐
│  MySQL 8.0（guzheng_heritage）                           │
│  users / messages / message_likes 三张表                 │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 目录结构

```
├── index.html              # 首页（主入口，含留言墙/登录/管理面板）
├── model-show.html         # 建模展示 · 筝笙双模型页
├── model-guzheng.html      # 建模展示 · 古筝 3D 页
├── model-sheng.html        # 建模展示 · 笙 3D 页
├── assets/                 # 静态资源（图片/视频/音频）
├── js/                     # 3D 查看器脚本
├── libs/                   # Three.js 及加载器
├── models/                 # 3D 模型文件（.glb）
├── quiz/                   # 互动答题
└── backend/                # Spring Boot 后端
    ├── pom.xml             # 依赖：Spring Boot 3.3.1 / MyBatis / JWT / BCrypt
    ├── sql/
    │   ├── init.sql        # 建库建表 + 种子留言数据
    │   └── upgrade.sql     # users / message_likes 表 + 管理员账号
    └── src/main/
        ├── java/com/guzheng/
        │   ├── controller/     # AuthController / MessageController
        │   ├── service/        # 业务逻辑（事务点赞、权限校验）
        │   ├── mapper/         # MyBatis 接口
        │   ├── entity/         # User / Message
        │   ├── common/         # Result / 全局异常处理 / 业务异常
        │   └── util/           # JwtUtil
        └── resources/
            ├── application.yml      # 端口 8080、数据库配置
            └── mapper/              # MyBatis XML
```

---

## 🛠️ 技术栈

| 层 | 技术 |
| --- | --- |
| 前端 | HTML + TailwindCSS + 原生 JavaScript（fetch） |
| 后端 | Java / Spring Boot 3.3.1 / MyBatis 3.0.3 |
| 安全 | JWT（java-jwt 4.3.0）、BCrypt（spring-security-crypto） |
| 数据 | MySQL 8.0 |
| 3D | Three.js（GLB 加载、DRACO 解码、OrbitControls） |

---

## 🔑 后端接口一览

| 方法 | 路径 | 说明 | 鉴权 |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | 注册（用户名即昵称） | 公开 |
| POST | `/api/auth/login` | 登录，返回 JWT | 公开 |
| GET | `/api/auth/users` | 用户列表 | 管理员 |
| POST | `/api/auth/users/{id}/ban?banned=1` | 拉黑 / 解封账号 | 管理员 |
| GET | `/api/messages?lang=zh&page=1&size=6` | 留言分页（按赞数排序） | 公开 |
| POST | `/api/messages` | 发布留言 | 登录用户 |
| POST | `/api/messages/{id}/like` | 点赞 / 取消点赞（防重复） | 登录用户 |
| DELETE | `/api/messages/{id}` | 删除留言（本人或管理员） | 登录用户 |

---

## 🚀 本地运行（完整演示）

**环境要求**：JDK 17+、Maven、MySQL 8.0

```bash
# 1. 初始化数据库（执行一次）
mysql -u root -p < backend/sql/init.sql
mysql -u root -p < backend/sql/upgrade.sql

# 2. 启动后端（默认 http://localhost:8080）
cd backend
mvn spring-boot:run

# 3. 打开前端
# 直接双击 index.html，或：
python -m http.server 8000   # 然后访问 http://localhost:8000
```

**演示账号**：管理员 `admin / admin123`（仅本地演示用途），普通用户可注册。

---

## 🌐 部署说明

- **前端**可部署到 GitHub Pages（静态托管）；
- **后端**为 Spring Boot 服务，需运行在本地或云服务器（当前未部署线上，面试演示使用本地环境）。

---

## 👨‍💻 个人项目职责

- 全栈开发：前端页面（HTML + TailwindCSS + JS）、后端 REST API（Spring Boot + MyBatis）
- 数据库设计：users / messages / message_likes 表结构、索引与种子数据
- 安全设计：JWT 鉴权、BCrypt 加密、管理员权限模型（role / banned 字段）
- 工程规范：统一响应、全局异常处理、参数校验、事务控制
- 3D 可视化：Three.js 模型加载与交互

---

## 📄 版权说明

音频、视频素材用于教学展示，版权归原作者所有；代码部分仅供学习交流。
