# 心跳守护系统 - 使用指南

## 功能特性

Everything Claude Code 的心跳守护系统提供**自动定时提醒**功能，帮助你保持对重要任务的持续关注。

### 核心功能

- ✅ **自动定时检查**：后台守护进程定期检查 HEARTBEAT.md 中的待办任务
- ✅ **系统通知**：通过 macOS/Linux 桌面通知提醒你
- ✅ **灵活配置**：自定义检查间隔（默认 30 分钟）
- ✅ **会话集成**：每次启动会话时自动提醒待办任务

## 快速开始

### 1. 启动心跳守护

```bash
# 方式一：使用便捷脚本（推荐）
./custom/scripts/heartbeat.sh start

# 方式二：直接使用 Node.js
node custom/scripts/heartbeat-daemon.js start

# 自定义检查间隔（例如 60 分钟）
./custom/scripts/heartbeat.sh start 60
```

### 2. 查看运行状态

```bash
./custom/scripts/heartbeat.sh status
```

输出示例：
```
💓 心跳守护运行中
💓 PID: 12345
💓 日志: ~/.heartbeat-daemon.log
```

### 3. 手动检查任务

```bash
./custom/scripts/heartbeat.sh check
```

### 4. 停止心跳守护

```bash
./custom/scripts/heartbeat.sh stop
```

## HEARTBEAT.md 格式

心跳守护会读取 `.claude/personalities/HEARTBEAT.md` 中的未完成任务（`- [ ]`）。

示例格式：

```markdown
# HEARTBEAT.md

## 每日检查

- [ ] 检查 pnpm outdated
- [ ] 运行 pnpm lint
- [ ] 查看今天的 GitHub 通知

## 每周检查

- [ ] 更新 README.md
- [ ] 审查最近的代码变更

## 持续关注

- [ ] 检查安全问题
- [ ] 关注 Claude Code 更新
```

## 工作原理

### 启动流程

1. **后台守护进程启动**
   - 解除进程关联（detached process）
   - 记录 PID 到 `~/.heartbeat-daemon.pid`
   - 日志写入 `~/.heartbeat-daemon.log`

2. **定时检查**
   - 立即执行第一次检查
   - 每隔 N 分钟检查一次（默认 30 分钟）
   - 解析 HEARTBEAT.md 中的未完成任务

3. **发送通知**
   - macOS: 使用 `osascript` 显示系统通知
   - Linux: 使用 `notify-send` 显示系统通知
   - 通知内容：待办任务数量和分类

### 会话集成

每次启动 Everything Claude Code 会话时：

1. **session-start hook** 自动运行
2. 加载人格和记忆文件
3. 显示快速提醒：有多少待办任务

示例输出：
```
💓 HEARTBEAT: 3 个待办任务在 HEARTBEAT.md 中
```

## 高级用法

### 开机自启动（macOS）

创建 Launch Agent：

```bash
cat > ~/Library/LaunchAgents/com.everything-claude-code.heartbeat.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.everything-claude-code.heartbeat</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/local/bin/node</string>
    <string>/path/to/everything-claude-code/custom/scripts/heartbeat-daemon.js</string>
    <string>start</string>
    <string>30</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>EnvironmentVariables</key>
  <dict>
    <key>CLAUDE_WORKSPACE</key>
    <string>/path/to/everything-claude-code</string>
  </dict>
</dict>
</plist>
EOF

# 加载 Launch Agent
launchctl load ~/Library/LaunchAgents/com.everything-claude-code.heartbeat.plist
```

### 自定义通知消息

修改 `heartbeat-daemon.js` 中的通知逻辑：

```javascript
// 自定义通知消息
const message = `💓 你有 ${tasks.daily.length} 个每日任务待完成`;
spawn('osascript', ['-e', `display notification "${message}" with title "Everything Claude Code"`]);
```

## 故障排查

### 守护进程未运行

```bash
# 查看状态
./custom/scripts/heartbeat.sh status

# 查看日志
tail -f ~/.heartbeat-daemon.log

# 手动重启
./custom/scripts/heartbeat.sh restart
```

### 通知未显示

**macOS:**
- 检查系统设置 → 通知 → 脚本编辑器 是否允许通知
- 尝试手动测试：`osascript -e 'display notification "测试" with title "测试"'`

**Linux:**
- 安装 libnotify-bin：`sudo apt install libnotify-bin`
- 检查桌面环境是否支持通知

### 停止失败的进程

```bash
# 强制删除 PID 文件
rm ~/.heartbeat-daemon.pid

# 查找并杀死残留进程
ps aux | grep heartbeat-daemon
kill -9 <PID>
```

## 相关文件

- **守护进程**: `custom/scripts/heartbeat-daemon.js`
- **检查脚本**: `custom/scripts/heartbeat.js`
- **便捷脚本**: `custom/scripts/heartbeat.sh`
- **任务定义**: `.claude/personalities/HEARTBEAT.md`
- **会话集成**: `custom/hooks/session-start.js`

## 下一步

- [ ] 启动心跳守护：`./custom/scripts/heartbeat.sh start`
- [ ] 编辑 HEARTBEAT.md 添加你的任务
- [ ] 测试通知是否正常显示
- [ ] （可选）配置开机自启动
