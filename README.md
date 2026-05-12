# 极智 AI 中转站（中文站点）

一个面向中文市场的 AI 模型聚合站点，包含：

- 官网营销页（深色科技风）
- 在线聊天页（多模型 Key）
- 管理后台（Key/支付/用量/订单）
- 真实支付链路（支付宝 + 微信）
- SEO + GEO 引流基础能力

---

## 1. 你现在能用的页面

- `/` 官网首页（中文营销页）
- `/chat` 在线对话页
- `/models` 模型能力页（SEO）
- `/pricing` 价格页（SEO）
- `/geo/[city]` 城市落地页（GEO）
- `/admin/login` 后台登录
- `/admin` 后台配置与数据面板

---

## 2. 已实现功能

### 2.1 模型聚合与消耗统计
- 支持 OpenAI / Anthropic / Google / Custom（OpenAI 兼容协议）
- 聊天请求结束后自动记录：
  - 输入 Token
  - 输出 Token
  - 总 Token
  - 估算成本（USD）

### 2.2 真实支付能力
- 支付宝：`alipay.trade.precreate` 下单 + RSA2 签名
- 微信支付：v3 Native 下单签名
- 支付宝回调：验签成功后更新订单
- 微信回调：验签 + APIv3 解密后更新订单
- 后台可查看订单状态、第三方单号、支付时间

### 2.3 SEO / GEO
- `robots.txt` / `sitemap.xml`
- 页面 metadata（title/description/canonical/openGraph）
- 首页结构化数据（FAQ + SoftwareApplication）
- 多城市 GEO 落地页（可扩展）

---

## 3. 快速启动

### 3.1 安装依赖
```bash
npm install
```

### 3.2 配置环境变量
```bash
cp .env.example .env
```

`.env` 关键字段：
- `DATABASE_URL`：数据库地址（默认 `file:./dev.db`）
- `ADMIN_PASSWORD`：后台登录密码
- `ADMIN_SESSION_SECRET`：后台会话签名密钥
- `ENCRYPTION_SECRET`：用于加密保存 Key/私钥
- `NEXT_PUBLIC_SITE_URL`：站点域名（生成 canonical/sitemap 用）

### 3.3 初始化数据库
```bash
npx prisma migrate dev
```

### 3.4 启动开发环境
```bash
npm run dev
```

---

## 4. 后台支付配置说明（重点）

后台路径：`/admin`

### 支付宝建议填写
- `appId`
- `privateKey`（商户私钥）
- `publicKey`（支付宝公钥，用于回调验签）
- `notifyUrl`（支付宝异步通知地址）
- `gateway`（可不填，默认官方）

### 微信支付建议填写
- `appId`
- `merchantId`（商户号）
- `privateKey`（商户私钥）
- `certSerial`（商户证书序列号）
- `apiV3Key`（长度 32）
- `publicKey`（微信平台公钥，用于回调验签）
- `notifyUrl`（微信支付回调地址）
- `gateway`（可不填，默认官方）

---

## 5. 目录结构（核心）

```text
app/
  page.tsx                        # 官网首页（中文）
  chat/page.tsx                   # 聊天页
  models/page.tsx                 # 模型页（SEO）
  pricing/page.tsx                # 价格页（SEO）
  geo/[city]/page.tsx             # GEO 城市落地页
  admin/                          # 后台
  api/
    chat/route.ts                 # 聊天接口 + 用量落库
    payments/
      create-order/route.ts       # 真实下单（支付宝/微信）
      alipay/notify/route.ts      # 支付宝回调验签
      wechat/notify/route.ts      # 微信回调验签+解密
      mock-pay/route.ts           # 开发环境模拟回调
  robots.ts                       # robots
  sitemap.ts                      # sitemap
lib/
  payment/                        # 支付签名、验签、解密逻辑
  model-provider.ts               # 模型路由与成本估算
  admin-auth.ts                   # 后台鉴权
  crypto.ts                       # AES 加密
prisma/
  schema.prisma
  migrations/
```

---

## 6. 常用命令

```bash
npm run dev
npm run lint
npm run build
npm run start
npx prisma studio
```

---

## 7. 当前反思与下一步建议

### 已完成
- 中文官网 + SEO/GEO 基础框架
- 模型聚合聊天与用量统计
- 支付真实签名/验签链路

### 推荐下一步
1. 用户系统（注册/登录/余额）  
2. 按余额或套餐进行扣费与限额  
3. 后台图表（按日、按模型、按 Key）  
4. 内容运营体系（案例页、教程页、更多城市页）  
5. 增加英文站，做国际 SEO 扩展
