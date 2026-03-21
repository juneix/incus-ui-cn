# Incus UI 中文定制版

`incus-ui-cn` 基于 [zabbly/incus-ui-canonical](https://github.com/zabbly/incus-ui-canonical) 整理。


## 💡 项目用途
- Incus 是 LXD 的社区版，他们都是基于 LXC 项目的。
- Incus 支持 LXC 容器和 VM 虚拟机。
- 提供一个轻量的中文版 Incus Web UI 前端

## 🚀 快速开始

### Docker Compose

```yaml
services:
  incus-ui-cn:
    image: ghcr.io/juneix/incus-ui-cn
    container_name: incus-ui-cn
    restart: always
    network_mode: host
    environment:
      port: 5566
      tls_verify: off
    volumes:
      - /opt/incus/cert:/run/incus:ro
```

### 内网登录验证

```bash
# 创建证书目录
sudo mkdir -p /opt/incus/cert

# 生成证书
sudo openssl req -x509 -newkey rsa:4096 -sha256 -days 3650 -nodes \
  -keyout /opt/incus/cert/incus-ui.key \
  -out /opt/incus/cert/incus-ui.crt \
  -subj "/CN=incus-ui-cn"

# 加入 Incus 信任列表
sudo incus config trust add-certificate /opt/incus/cert/incus-ui.crt
```

### 访问 web 面板

```bash
http://ip:5566/ui/
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
