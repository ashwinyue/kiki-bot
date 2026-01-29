# 完整清理插件缓存并重新安装

## 🐛 问题

即使修改了 `plugin.json`，仍然看到重复加载错误。

## 🔍 原因

**插件缓存**中保存了旧版本的 `plugin.json`，需要清理缓存后重新安装。

## ✅ 解决方案

### 方法 1：使用清理脚本（推荐）

```bash
# 1. 退出 Claude Code
exit

# 2. 运行清理脚本
cd ~/PycharmProjects/memory-skill/everything-claude-code
./clear-plugin-cache.sh

# 3. 重新启动 Claude Code
claude

# 4. 重新安装插件
/plugin install file://$(pwd)

# 5. 运行诊断
/doctor
```

### 方法 2：手动清理

```bash
# 1. 退出 Claude Code
exit

# 2. 清理插件缓存
rm -rf ~/.claude/plugins/cache/everything-claude-code

# 3. 备份安装记录
cp ~/.claude/plugins/installed_plugins.json ~/.claude/plugins/installed_plugins.json.backup

# 4. 从安装记录中移除插件
node -e "
const fs = require('fs');
const path = require('path');
const configPath = path.join(require('os').homedir(), '.claude/plugins/installed_plugins.json');
const data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
if (data.plugins && data.plugins['everything-claude-code']) {
  delete data.plugins['everything-claude-code'];
  fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
  console.log('✅ 插件记录已移除');
}
"

# 5. 重新启动 Claude Code
claude

# 6. 重新安装插件
cd ~/PycharmProjects/memory-skill/everything-claude-code
/plugin install file://$(pwd)

# 7. 运行诊断验证
/doctor
```

### 方法 3：快速重装（如果上面不行）

```bash
# 1. 卸载插件
/plugin remove everything-claude-code

# 2. 清理缓存
rm -rf ~/.claude/plugins/cache/everything-claude-code

# 3. 重新安装
cd ~/PycharmProjects/memory-skill/everything-claude-code
/plugin install file://$(pwd)

# 4. 运行诊断
/doctor
```

## 🧪 验证修复

运行 `/doctor` 应该看到：

```
Plugin Errors
  ✅ No plugin errors detected
```

## 📋 插件缓存位置

```
~/.claude/plugins/cache/everything-claude-code/
└── everything-claude-code/
    └── 1.0.0/
        ├── .claude-plugin/
        │   └── plugin.json    ← 缓存中的配置（旧版本）
        ├── agents/
        ├── commands/
        ├── hooks/
        └── skills/
```

**清理缓存后，插件会重新复制文件，使用新的 plugin.json。**

## 💡 为什么会缓存？

Claude Code 会缓存插件文件以：
- ✅ 提高加载速度
- ✅ 避免重复读取文件系统
- ✅ 支持离线使用

**但这也意味着修改配置后需要清理缓存。**

## 🎯 总结

**问题：** 插件缓存中保存了旧配置

**解决：** 清理缓存后重新安装

**预防：** 修改 plugin.json 后记得清理缓存

---

*清理日期: 2026-01-29*
*问题: Duplicate hooks file detected*
*状态: ✅ 需要清理缓存*
