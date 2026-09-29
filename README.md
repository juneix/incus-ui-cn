# Incus UI 中文定制版

`incus-ui-cn` 基于 [zabbly/incus-ui-canonical](https://github.com/zabbly/incus-ui-canonical) 整理，提供了一个轻量的 Incus UI 中文定制版前端。


## 💡 Incus 介绍
> Incus 是下一代系统容器、应用容器和虚拟机管理器。它提供的用户体验类似于公共云。借助它，你可以轻松混合搭配 LXC 容器和 VM 虚拟机，共享相同的底层存储和网络。

Incus 是 LXD 的社区分支版本，二者均基于 LXC 项目。因为 Incus 默认不包括 Web UI，所以有了本项目。

- 中文定制版 Docker 镜像体积约 80 MB
- 原版 incus-ui-canonical 的 apt 依赖包体积约 500 MB

## 🚀 快速开始

### 运行方式

#### 1. 默认免密直登（内网极简）
只需将生成的客户端证书挂载到容器中，访问即可直接进入控制台管理，无需每次在浏览器导入证书或输入 Token：

```yaml
services:
  incus-ui-cn:
    image: ghcr.io/juneix/incus-ui-cn
    container_name: incus-ui-cn
    restart: always
    network_mode: host
    environment:
      port: 5566
      backend: https://127.0.0.1:8443
      tls_verify: off
    volumes:
      - /opt/incus/cert:/run/incus:ro
```

#### 2. 简易账号密码保护（可选）
如果需要在公网或受限内网暴露，希望增加轻量访问控制，只需添加 `BASIC_AUTH_USER` 和 `BASIC_AUTH_PASS` 环境变量，容器将自动启用浏览器原生 HTTP Basic Auth 弹窗认证，零额外性能开销：

```yaml
services:
  incus-ui-cn:
    image: ghcr.io/juneix/incus-ui-cn
    container_name: incus-ui-cn
    restart: always
    network_mode: host
    environment:
      port: 5566
      backend: https://127.0.0.1:8443
      tls_verify: off
      BASIC_AUTH_USER: admin
      BASIC_AUTH_PASS: your_strong_password
    volumes:
      - /opt/incus/cert:/run/incus:ro
```

#### 3. 进阶生产部署（推荐配合外部反代）
在生产或公网环境中，推荐使用专业反代工具进行统一鉴权与 HTTPS 加密：
- **Nginx Proxy Manager / 宝塔**：配置 SSL 证书并开启 Access List（基础认证）或转发到 Authelia。
- **Traefik**：添加 `BasicAuth` 或 `ForwardAuth` 中间件。
- **Cloudflare Zero Trust / Access**：配置域名直接挂载 Cloudflare 访问策略（邮箱验证码/Github/OIDC SSO）。

### 访问 Web 面板

```bash
http://ip:5566/ui/
```

## 📂 项目结构说明

```text
incus-ui-cn/
├── Dockerfile                  # 生产镜像构建文件 (Node 24 构建 + Nginx Alpine 运行)
├── docker/                     # 容器运行时配置
│   └── nginx/
│       ├── default.conf.template  # Nginx 反向代理配置模板 (端口/后端/TLS)
│       └── render-config.sh       # 容器启动渲染脚本 (自动生成 htpasswd / 证书附加)
├── src/                        # 前端源码 (React 19 + TypeScript)
│   ├── components/             # 通用 UI 交互组件、表单与导航控件
│   ├── context/                # 全局状态管理 (认证、项目上下文、服务器设置)
│   ├── i18n/                   # 中文轻量字典系统 (dict.ts)
│   ├── pages/                  # 核心业务页面 (实例、存储卷/池/桶、网络与ACL、配置模板、系统监控等)
│   └── util/                   # 工具函数、OpenFGA 权限对照表与版本声明
├── .github/                    # 自动化工作流
│   └── workflows/
│       └── docker-publish.yml  # 多架构 Docker 镜像自动化云构建流水线
├── package.json                # 项目依赖与全局版本定义
├── vite.config.ts              # 前端打包配置、动态版本注入与本地代理
└── README.md                   # 项目主说明文档
```

## ❤️ 支持项目

- 打赏鼓励：支持我开发更多有趣应用
- 互动群聊：加入 💬 [QQ 群](https://qm.qq.com/q/ZzOD5Qbhce) 可在线催更
- 更多内容：访问 ➡️ [谢週五の藏经阁](https://5nav.eu.org)

<div align="center">
  <table>
    <tr>
      <td align="center">
        <img src="./pic/wechat.webp" width="128" /><br/>
        <sub>微信</sub>
      </td>
      <td align="center">
        <img src="./pic/alipay.webp" width="128" /><br/>
        <sub>支付宝</sub>
      </td>
    </tr>
  </table>
</div>

## 📝 许可证

- [LICENSE](LICENSE)
