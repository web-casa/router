# 临时只读访问（PVE）

这是为 PVE 页面采集环境信息而建立的临时访问，不是长期运维账号。

> 本次实验已清理：`docsread`、sudoers、sshd Match、临时 key 均已删除。以下步骤保留为可复用 runbook。

## 已创建

- 用户 `docsread`（无密码，仅公钥）；
- `/usr/local/sbin/pve-docs-readonly`：固定只读命令；
- `/etc/sudoers.d/pve-docs-readonly`：只允许执行上面的 wrapper；
- `/etc/ssh/sshd_config` 末尾的 `Match User docsread`：强制命令、禁转发；
- 本地临时密钥：`.fleet/keys/pve-docs-ed25519`（已在 `.gitignore`，不会提交）。

## 使用

```bash
ssh -i .fleet/keys/pve-docs-ed25519 docsread@192.168.50.2
```

只会输出只读报告，不能开 shell、不能转发端口、不能改配置。

## 清理

在 PVE 上以 root 执行：

```bash
userdel -r docsread 2>/dev/null || true
rm -f /etc/sudoers.d/pve-docs-readonly /usr/local/sbin/pve-docs-readonly
sed -i '/^# BEGIN pve-docs-readonly$/,/^# END pve-docs-readonly$/d' /etc/ssh/sshd_config
sshd -t && systemctl reload ssh
```

本地删除临时密钥：

```bash
rm -rf .fleet/keys
```

另外，root 密钥仍然有完整权限；如果它只是为这次采集准备的，请从 `/root/.ssh/authorized_keys` 删除对应公钥并轮换。`/etc/ssh/sshd_config.bak.pve-docs.*` 是安装时的备份，确认新配置稳定后可删除。
