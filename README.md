# Incus UI CN Lite

`incus-ui-cn` 是基于 [zabbly/incus-ui-canonical](https://github.com/zabbly/incus-ui-canonical) 整理的轻量分支。

项目用途：

- 保留适合自托管的 Incus Web UI 前端
- 提供轻量 Docker 镜像构建与运行方式
- 后续在这个分支上继续做中文化

## Docker Compose

下面是一个开箱即用的 `docker-compose.yml` 示例：

```yaml
services:
  incus-ui-cn:
    image: ghcr.io/juneix/incus-ui-cn
    container_name: incus-ui-cn
    restart: always
    network_mode: host
    environment:
      INCUS_TLS_VERIFY: off
```
访问网页控制台：

```bash
http://ip:5566/ui/
```

## License

本仓库保留上游许可证文件：

- [LICENSE](LICENSE)
