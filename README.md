# AI 聚合聊天与支付后台（MVP）

这是一个可运行的第一版站点，目标是帮助你快速搭建：

1. 前台聊天页面（可切换不同模型 Key）  
2. 后台管理页面（管理模型 Key、支付参数）  
3. 记录并展示每次调用的 Token 消耗和估算成本  
4. 提供支付宝/微信支付的下单与回调接口骨架

---

## 1. 这个项目能做什么

### 前台功能（`/`）
- 选择一个已启用的模型 Key
- 可手动输入模型名（例如 `gpt-4.1-mini`）
- 直接聊天
- 聊天调用后，自动写入用量日志（Token、估算成本）

### 后台功能（`/admin`）
- 管理员密码登录
- 新增/编辑/删除模型 Key（OpenAI / Anthropic / Google / Custom）
- 配置支付宝、微信支付参数（AppId、商户号、私钥、公钥、回调地址）
- 查看最近用量明细（输入 Token、输出 Token、总 Token、估算成本）
- 查看最近订单
- 开发环境可用“订单联调工具”模拟下单和支付回调

---

## 2. 技术栈

- 前端/后端一体：Next.js 16 + App Router + TypeScript
- AI 调用：Vercel AI SDK（`ai` + `@ai-sdk/*`）
- 数据库：Prisma + SQLite
- 样式：Tailwind CSS 4

---

## 3. 快速启动（小白版）

### 第一步：安装依赖

```bash
npm install
```

### 第二步：创建环境变量

把 `.env.example` 复制为 `.env`，并按需修改：

```bash
cp .env.example .env
```

`.env` 里最重要的四项：

- `DATABASE_URL`：数据库路径（默认 `file:./dev.db`）
- `ADMIN_PASSWORD`：后台登录密码
- `ADMIN_SESSION_SECRET`：后台会话签名密钥
- `ENCRYPTION_SECRET`：用于加密保存模型/支付私钥

### 第三步：初始化数据库

```bash
npx prisma migrate dev --name init
```

### 第四步：启动项目

```bash
npm run dev
```

打开浏览器：

- 前台聊天页：`http://localhost:3000`
- 后台登录页：`http://localhost:3000/admin/login`

---

## 4. 关键目录说明

```text
app/
  page.tsx                      # 前台聊天页
  chat-client.tsx               # 聊天客户端组件
  admin/
    page.tsx                    # 后台首页（配置 + 统计）
    login/page.tsx              # 后台登录页
    actions.ts                  # 后台表单提交逻辑（Server Actions）
    order-tools.tsx             # 开发环境订单联调工具
  api/
    chat/route.ts               # 聊天接口（写入 usage 日志）
    payments/
      create-order/route.ts     # 创建订单
      mock-pay/route.ts         # 模拟支付成功回调
      alipay/notify/route.ts    # 支付宝回调骨架
      wechat/notify/route.ts    # 微信回调骨架
lib/
  prisma.ts                     # Prisma 客户端
  model-provider.ts             # 模型路由、默认模型、成本估算
  admin-auth.ts                 # 管理员会话
  crypto.ts                     # 密钥加解密
  env.ts                        # 环境变量校验
prisma/
  schema.prisma                 # 数据模型
  migrations/                   # 数据库迁移
```

---

## 5. 数据模型说明（核心）

- `ModelProviderKey`：保存模型平台 Key（加密后存储）
- `UsageLog`：每次 AI 调用产生的 token 与估算成本
- `PaymentConfig`：支付宝/微信支付配置（私钥加密）
- `RechargeOrder`：充值订单（待支付/已支付/失败）

---

## 6. 支付接入现状（非常重要）

当前版本已经提供：
- 下单接口
- 支付宝/微信回调入口
- 配置管理后台
- 联调用的模拟回调接口

但**生产可用**还差最后一步：  
你需要在回调接口中加入“官方验签/解密逻辑”（代码中已写 TODO 提示）。

也就是说，现在是“可开发联调版”，不是“已上线收款版”。

---

## 7. 模型消耗统计说明

每次聊天请求结束后，系统会记录：

- 使用了哪个 Key
- 使用了哪个模型
- 输入/输出/总 Token
- 估算成本（USD）

> 注意：估算成本依赖 `lib/model-provider.ts` 里的价格表。  
> 如果你使用新模型，需要把该模型价格补进去，统计才会更准确。

---

## 8. 我对这次实现的反思与下一步建议

### 已完成
- 用最简单可控方式搭好了从“聊天 -> 记账 -> 后台查看”的完整主链路
- 支付模块已经具备配置、下单、回调入口和联调能力

### 还需要改进
1. 增加普通用户系统（注册/登录/余额）  
2. 支付回调接入真实验签逻辑（支付宝 RSA、微信 v3 签名）  
3. 增加按日/按模型/按 Key 的图表统计  
4. 增加 Key 配额、限流、告警（防止超额）  
5. 增加多租户与分销功能（如果你要做商业化）

---

## 9. 常用命令

```bash
npm run dev           # 开发启动
npm run build         # 生产构建
npm run start         # 生产运行
npm run lint          # 代码检查
npx prisma studio     # 可视化看数据库
```

---

如果你要我继续做下一步，我建议优先做：  
**“真实支付验签 + 用户余额扣费 + 管理后台图表统计”**，这样就接近可上线版本了。
