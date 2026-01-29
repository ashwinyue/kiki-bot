# HEARTBEAT 定时守护进程使用指南

## 📋 概述

HEARTBEAT 定时守护进程（heartbeat-daemon）是一个后台服务，会**定期检查 HEARTBEAT.md 中的待办任务**，并通过系统通知主动提醒你。

与 SessionStart/SessionEnd hook 不同，守护进程是**独立运行的**，不需要打开 Claude Code 就能工作。

## 🚀 快速开始

### 启动守护进程

```bash
# 启动（默认 30 分钟间隔）
./custom/scripts/heartbeat-service.sh start

# 启动（15 分钟间隔）
./custom/scripts/heartbeat-service.sh start 15

# 启动（5 分钟间隔，适合开发）
./custom/scripts/heartbeat-service.sh start 5

# 启动（30 秒间隔，仅用于测试）
./custom/scripts/heartbeat-service.sh start 0.5
```

### 查看状态

```bash
./custom/scripts/heartbeat-service.sh status
```

**输出示例：**
```
💓 心跳守护运行中
💓 PID: 24961
💓 日志: /Users/solariswu/.heartbeat-daemon.log
```

### 查看日志

```bash
# 查看最近 50 行日志
./custom/scripts/heartbeat-service.sh logs

# 实时查看日志
tail -f ~/.heartbeat-daemon.log
```

**日志示例：**
```
[2026-01-29T04:08:14.779Z] 💓 心跳守护启动
[2026-01-29T04:08:14.779Z] 💓 提醒发送: 13 个待办任务
[2026-01-29T04:38:14.783Z] 💓 提醒发送: 13 个待办任务
[2026-01-29T05:08:14.787Z] 💓 提醒发送: 12 个待办任务
```

### 停止守护进程

```bash
./custom/scripts/heartbeat-service.sh stop
```

## ⚙️ 配置说明

### 检查间隔

守护进程会定期检查 HEARTBEAT.md 中的任务并发送通知。

| 间隔 | 用途 | 示例 |
|------|------|------|
| **30 分钟** | 生产环境（推荐） | 日常开发，不会太频繁 |
| **15 分钟** | 重要任务 | 有紧急任务需要跟进 |
| **5 分钟** | 开发测试 | 快速验证通知功能 |
| **0.5 分钟** | 调试 | 仅用于测试，不要长期使用 |

**格式：**
- 数字 = 分钟（例如: `30` = 30 分钟）
- 小数 = 分钟（例如: `0.5` = 30 秒）

**建议配置：**
```bash
# 日常使用（推荐）
./custom/scripts/heartbeat-service.sh start 30

# 重要任务期间
./custom/scripts/heartbeat-service.sh start 15

# 测试通知
./custom/scripts/heartbeat-service.sh start 0.5
```

### 通知行为

守护进程在以下情况**不会发送通知**：

1. ✅ **所有任务已完成**（HEARTBEAT.md 中没有 `[ ]` 未完成任务）
2. ✅ **HEARTBEAT.md 文件不存在**
3. ✅ **无法解析任务**

**通知内容：**
```
标题: 💓 心跳提醒: 13 个待办任务
消息: 打开 HEARTBEAT.md 查看详情
```

### macOS 通知

守护进程使用 `osascript` 发送 macOS 系统通知：

```bash
osascript -e 'display notification "💓 心跳提醒: 13 个待办任务" with title "Everything Claude Code"'
```

**确保通知权限：**
1. 系统偏好设置 → 通知 → Node.js
2. 确保"允许通知"已启用

### Linux 通知

守护进程使用 `notify-send` 发送 Linux 系统通知：

```bash
notify-send "Everything Claude Code" "💓 心跳提醒: 13 个待办任务"
```

**安装依赖（如需要）：**
```bash
# Ubuntu/Debian
sudo apt-get install libnotify-bin

# Fedora
sudo dnf install libnotify

# Arch Linux
sudo pacman -S libnotify
```

## 🔧 高级功能

### 开机自启动（macOS）

```bash
# 配置开机自启动
./custom/scripts/heartbeat-service.sh enable

# 禁用开机自启动
./custom/scripts/heartbeat-service.sh disable
```

**原理：**
- 创建 `~/Library/LaunchAgents/com.heartbeat.daemon.plist`
- 使用 macOS LaunchAgent 自动启动
- 守护进程会在登录后自动启动

**手动管理：**
```bash
# 查看 launchd 服务
launchctl list | grep heartbeat

# 手动加载
launchctl load ~/Library/LaunchAgents/com.heartbeat.daemon.plist

# 手动卸载
launchctl unload ~/Library/LaunchAgents/com.heartbeat.daemon.plist
```

### 开机自启动（Linux）

```bash
# 配置开机自启动
./custom/scripts/heartbeat-service.sh enable

# 禁用开机自启动
./custom/scripts/heartbeat-service.sh disable
```

**原理：**
- 创建 `~/.config/systemd/user/heartbeat-daemon.service`
- 使用 systemd 用户服务自动启动
- 守护进程会在登录后自动启动

**手动管理：**
```bash
# 查看服务状态
systemctl --user status heartbeat-daemon

# 启动服务
systemctl --user start heartbeat-daemon

# 停止服务
systemctl --user stop heartbeat-daemon

# 查看日志
journalctl --user -u heartbeat-daemon -f
```

### 手动管理（不使用 heartbeat-service.sh）

```bash
# 直接启动守护进程
node custom/scripts/heartbeat-daemon.js start 30

# 直接停止守护进程
node custom/scripts/heartbeat-daemon.js stop

# 查看状态
node custom/scripts/heartbeat-daemon.js status
```

## 📂 文件位置

### 文件结构

```
~/
├── .heartbeat-daemon.pid        # 进程 PID 文件
└── .heartbeat-daemon.log        # 守护进程日志

everything-claude-code/
├── custom/scripts/
│   ├── heartbeat-daemon.js      # 守护进程代码
│   └── heartbeat-service.sh     # 服务管理脚本

.claude/
└── personalities/
    └── HEARTBEAT.md             # 任务定义文件

~/Library/LaunchAgents/          # macOS
├── └── com.heartbeat.daemon.plist

~/.config/systemd/user/          # Linux
└── heartbeat-daemon.service
```

### 日志文件

**位置：** `~/.heartbeat-daemon.log`

**格式：**
```
[2026-01-29T04:08:14.779Z] 💓 心跳守护启动
[2026-01-29T04:08:14.779Z] 💓 提醒发送: 13 个待办任务
[2026-01-29T04:38:14.783Z] 💓 提醒发送: 13 个待办任务
```

**查看日志：**
```bash
# 查看最近 50 行
tail -n 50 ~/.heartbeat-daemon.log

# 实时查看
tail -f ~/.heartbeat-daemon.log

# 搜索特定内容
grep "提醒发送" ~/.heartbeat-daemon.log
```

### PID 文件

**位置：** `~/.heartbeat-daemon.pid`

**内容：**
```
24961
```

**用途：**
- 跟踪守护进程的进程 ID
- 防止重复启动
- 用于停止进程

## 🆚 与 SessionStart/SessionEnd Hook 的对比

| 特性 | SessionStart/SessionEnd Hook | 定时守护进程 |
|------|------------------------------|--------------|
| **触发时机** | 会话开始/结束时 | 定时（独立运行） |
| **需要打开 Claude Code** | ✅ 是 | ❌ 否 |
| **系统通知** | ✅ 有 | ✅ 有 |
| **持续提醒** | ❌ 仅会话时 | ✅ 24/7 |
| **开机自启动** | ❌ 否 | ✅ 可配置 |
| **资源占用** | 低 | 极低 |
| **推荐场景** | 日常开发 | 重要任务跟进 |

### 使用建议

**使用 Hook：**
- ✅ 日常开发工作
- ✅ 不需要持续提醒
- ✅ 节省系统资源

**使用守护进程：**
- ✅ 有重要任务需要跟进
- ✅ 需要在非工作时间提醒
- ✅ 希望任务定期检查
- ✅ 需要开机自启动

**同时使用：**
- ✅ Hook + 守护进程可以同时启用
- ✅ Hook 提供会话时提醒
- ✅ 守护进程提供持续提醒

## 🛠️ 故障排除

### 问题：守护进程无法启动

**检查 1: Node.js 是否安装**
```bash
node --version
# 应该显示 v18 或更高版本
```

**检查 2: 文件是否存在**
```bash
ls -la custom/scripts/heartbeat-daemon.js
ls -la custom/scripts/heartbeat-service.sh
```

**检查 3: 权限是否正确**
```bash
chmod +x custom/scripts/heartbeat-service.sh
```

### 问题：通知没有显示

**macOS：**
1. 系统偏好设置 → 通知 → Node.js
2. 确保"允许通知"已启用
3. 检查"提醒样式"是否设置为"警报"

**Linux：**
```bash
# 测试通知
notify-send "测试" "测试通知"

# 如果失败，安装 libnotify
sudo apt-get install libnotify-bin
```

### 问题：守护进程频繁崩溃

**检查日志：**
```bash
tail -f ~/.heartbeat-daemon.log
```

**可能原因：**
1. HEARTBEAT.md 格式错误
2. Node.js 版本不兼容
3. 系统资源不足

**解决方案：**
```bash
# 验证 HEARTBEAT.md 格式
node custom/scripts/heartbeat.js

# 重启守护进程
./custom/scripts/heartbeat-service.sh restart
```

### 问题：重复启动守护进程

**现象：**
```
⚠️  守护进程已在运行 (PID: 24961)
```

**解决方案：**
```bash
# 先停止
./custom/scripts/heartbeat-service.sh stop

# 再启动
./custom/scripts/heartbeat-service.sh start 30
```

**或强制停止：**
```bash
# 删除 PID 文件
rm -f ~/.heartbeat-daemon.pid

# 杀死所有相关进程
pkill -f heartbeat-daemon.js

# 重新启动
./custom/scripts/heartbeat-service.sh start 30
```

### 问题：开机自启动不工作

**macOS：**
```bash
# 检查 launch agent 是否加载
launchctl list | grep heartbeat

# 手动加载
launchctl load ~/Library/LaunchAgents/com.heartbeat.daemon.plist

# 查看错误
launchctl list | grep -i heartbeat
```

**Linux：**
```bash
# 检查服务状态
systemctl --user status heartbeat-daemon

# 查看错误日志
journalctl --user -u heartbeat-daemon -n 50

# 手动启动
systemctl --user start heartbeat-daemon
```

## 📊 性能和资源

### 资源占用

守护进程的资源占用极低：

```
PID   USER      %CPU  %MEM  TIME     COMMAND
24961 solariswu 0.0   0.1   0:00.05  node heartbeat-daemon.js run 30
```

- **CPU**: < 0.1% (空闲时)
- **内存**: ~10-20 MB
- **磁盘 I/O**: 仅读取 HEARTBEAT.md

### 电池影响

- **MacBook**: 可忽略不计
- **笔记本**: 无明显影响
- **建议**: 如果使用电池，可以增加间隔到 60 分钟

## 🎯 最佳实践

### 1. 选择合适的间隔

| 使用场景 | 推荐间隔 | 说明 |
|----------|----------|------|
| 日常开发 | 30 分钟 | 不会太频繁 |
| 重要任务 | 15 分钟 | 确保及时跟进 |
| 休息日 | 60 分钟 | 减少打扰 |
| 测试 | 0.5-5 分钟 | 快速验证 |

### 2. 配合 Hook 使用

```bash
# Hook: SessionStart/SessionEnd（已在 hooks.json 中配置）
# 守护进程: 定时检查

# 两者互补，确保不会忘记任务
```

### 3. 定期标记任务完成

```markdown
## 每日检查

- [x] 检查 pnpm outdated        ← 已完成
- [ ] 运行 pnpm lint             ← 待办
- [ ] 查看今天的 GitHub 通知    ← 待办
```

### 4. 调整通知频率

根据实际情况调整：
- 任务多 → 减少间隔（15 分钟）
- 任务少 → 增加间隔（60 分钟）
- 休息日 → 停止守护进程

## 📚 相关文档

- [HEARTBEAT System Guide](HEARTBEAT-SYSTEM-GUIDE.md) - HEARTBEAT 系统总览
- [Memory Auto-Update Guide](MEMORY-AUTO-UPDATE-GUIDE.md) - 记忆自动更新
- [Implementation Summary](IMPLEMENTATION-SUMMARY.md) - 完整实现总结

## 🎉 总结

HEARTBEAT 定时守护进程提供：

✅ **24/7 任务提醒**
- 独立运行，不需要打开 Claude Code
- 定期检查并发送系统通知

✅ **灵活配置**
- 可调整检查间隔（30 分钟推荐）
- 支持开机自启动

✅ **极低资源占用**
- CPU < 0.1%
- 内存 ~10-20 MB

✅ **与 Hook 互补**
- Hook: 会话时提醒
- 守护进程: 持续提醒

**现在你拥有与 Moltbot 完全相同的 HEARTBEAT 功能！**

---

*最后更新: 2026-01-29*
