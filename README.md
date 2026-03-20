# Incus UI CN Lite

`incus-ui-cn` 是基于 [zabbly/incus-ui-canonical](https://github.com/zabbly/incus-ui-canonical) 整理的轻量分支。

项目用途：

- 保留适合自托管的 Incus Web UI 前端
- 提供轻量 Docker 镜像构建与运行方式
- 后续在这个分支上继续做中文化

## Docker Compose

下面是一个最小可用的 `docker-compose.yml` 示例：

```yaml
services:
  incus-ui-cn:
    image: ghcr.io/juneix/incus-ui-cn
    ports:
      - "5566:5566"
    environment:
      INCUS_BACKEND: https://host.docker.internal:8443
      INCUS_TLS_VERIFY: off
    extra_hosts:
      - "host.docker.internal:host-gateway"
```

启动：

```bash
docker compose up -d
```

访问：

```bash
http://localhost:5566/ui/
```

如果 Incus API 需要客户端证书，可以额外挂载：

```yaml
    volumes:
      - ./client.crt:/run/incus/client.crt:ro
      - ./client.key:/run/incus/client.key:ro
```

## License

本仓库保留上游许可证文件：

- [LICENSE](LICENSE)
