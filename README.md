# Incus UI CN Lite

`incus-ui-cn` 基于 [zabbly/incus-ui-canonical](https://github.com/zabbly/incus-ui-canonical) 整理。


## 简单科普：
- Incus 是 LXD 的社区版，他们都是基于 LXC 项目的。
- 支持 LXC 容器和 VM 虚拟机。

## 项目用途：

- 提供一个轻量的中文版 Incus Web UI 前端
- 支持宿主机部署或 Docker 部署

## Docker Compose

```yaml
services:
  incus-ui-cn:
    image: ghcr.io/juneix/incus-ui-cn:latest
    container_name: incus-ui-cn
    restart: always
    network_mode: host
    environment:
      port: 5566
      tls_verify: off
    volumes:
      - ./config:/run/incus:ro
```

访问：

```bash
http://ip:5566/ui/
```

## License

- [LICENSE](LICENSE)
