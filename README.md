# Incus UI CN Lite

`incus-ui-cn` 基于 [zabbly/incus-ui-canonical](https://github.com/zabbly/incus-ui-canonical) 整理。

项目用途：

- 提供一个轻量的 Incus Web UI 前端
- 支持直接从源码构建静态文件
- 支持宿主机部署或 Docker 部署
- 后续继续做中文化

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
