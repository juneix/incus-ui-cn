export const DICT = {
  // 通用操作
  create: "创建",
  edit: "编辑",
  delete: "删除",
  save: "保存",
  cancel: "取消",
  copy: "复制",
  refresh: "刷新",
  search: "搜索",
  upload: "上传",
  download: "下载",
  reboot: "重启",
  restart: "重启",
  stop: "停止",
  start: "启动",
  freeze: "挂起",
  unfreeze: "恢复",
  export: "导出",
  import: "导入",
  view: "查看",
  configure: "配置",
  confirm: "确认",
  submit: "提交",
  back: "返回",
  close: "关闭",
  next: "下一步",
  previous: "上一步",
  actions: "操作",
  add: "添加",
  remove: "移除",
  clear: "清空",
  migrate: "迁移",
  apply: "应用",

  // 状态
  running: "运行中",
  stopped: "已停止",
  frozen: "已挂起",
  error: "错误",
  starting: "正在启动",
  stopping: "正在停止",
  ready: "就绪",
  success: "成功",
  warning: "警告",
  pending: "待处理",
  unknown: "未知",
  active: "活跃",
  inactive: "未激活",
  online: "在线",
  offline: "离线",

  // 实体名词
  instances: "实例",
  instance: "实例",
  containers: "容器",
  container: "容器",
  vms: "虚拟机",
  vm: "虚拟机",
  images: "镜像",
  image: "镜像",
  storagePools: "存储池",
  storagePool: "存储池",
  storageVolumes: "存储卷",
  storageVolume: "存储卷",
  storageBuckets: "存储桶",
  storageBucket: "存储桶",
  networks: "网络",
  network: "网络",
  networkForwards: "网络转发",
  loadBalancers: "负载均衡器",
  profiles: "配置模板",
  profile: "配置模板",
  projects: "项目",
  project: "项目",
  cluster: "集群",
  members: "成员",
  member: "成员",
  groups: "分组",
  group: "分组",
  snapshots: "快照",
  snapshot: "快照",
  acls: "访问控制列表",
  ipam: "IP 地址管理",
  operations: "操作记录",
  settings: "设置",
  certificates: "证书",
  identities: "身份",
  roles: "角色",

  // 常用表头
  name: "名称",
  description: "描述",
  status: "状态",
  type: "类型",
  size: "大小",
  used: "已使用",
  total: "总量",
  free: "可用",
  driver: "驱动",
  location: "节点",
  architecture: "架构",
  createdAt: "创建时间",
  updatedAt: "更新时间",
  expiresAt: "过期时间",
  fingerprint: "指纹",
  ipAddress: "IP 地址",
  ipv4: "IPv4 地址",
  ipv6: "IPv6 地址",
  macAddress: "MAC 地址",
  pool: "所属存储池",
  source: "来源",
  target: "目标",
  ports: "端口",
  listenAddress: "监听地址",
  targetAddress: "目标地址",

  // 提示信息
  loading: "正在加载...",
  noData: "暂无数据",
  confirmDelete: "确认删除",
  actionSuccess: "操作成功",
  actionFailed: "操作失败",
  permissionDenied: "权限不足",
} as const;

export type DictKey = keyof typeof DICT;

export const t = (key: DictKey, fallback?: string): string => {
  return DICT[key] ?? fallback ?? key;
};

export const getStatusText = (status: string): string => {
  const lower = status.toLowerCase();
  switch (lower) {
    case "running":
      return "运行中";
    case "stopped":
      return "已停止";
    case "frozen":
      return "已挂起";
    case "error":
    case "failure":
      return "错误";
    case "starting":
      return "正在启动";
    case "stopping":
      return "正在停止";
    case "cancelling":
      return "正在取消";
    case "cancelled":
      return "已取消";
    case "success":
      return "成功";
    case "pending":
      return "等待中";
    default:
      return status;
  }
};
