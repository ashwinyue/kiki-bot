# 修复插件 Hooks 重复加载错误

## 🐛 问题描述

```
Plugin Errors:
  everything-claude-code: Hook load failed: Duplicate hooks file detected:
  ./hooks/hooks.json resolves to already-loaded file
```

## 🔍 根本原因

**Claude Code 插件系统会自动加载 `hooks/hooks.json`**，不需要在 `plugin.json` 中显式声明。

### 错误的配置

```json
{
  "name": "everything-claude-code",
  "commands": ["./commands/"],
  "skills": ["./skills/"],
  "agents": ["./agents/..."],
  "hooks": "./hooks/hooks.json"  // ❌ 错误：会导致重复加载
}
```

**加载流程：**
1. Claude Code 自动加载 `hooks/hooks.json`
2. 然后 plugin.json 又声明加载 `hooks/hooks.json`
3. 结果：重复加载 → 错误

### 正确的配置

```json
{
  "name": "everything-claude-code",
  "commands": ["./commands/"],
  "skills": ["./skills/"],
  "agents": ["./agents/..."]
  // ✅ 不需要声明 hooks，会被自动加载
}
```

## ✅ 修复方案

### 修改前

```json
{
  "agents": [
    "./agents/architect.md",
    "./agents/build-error-resolver.md",
    ...
  ],
  "hooks": "./hooks/hooks.json"  // ❌ 删除这行
}
```

### 修改后

```json
{
  "agents": [
    "./agents/architect.md",
    "./agents/build-error-resolver.md",
    ...
  ]
  // ✅ 移除了 hooks 声明
}
```

## 🧪 验证修复

```bash
# 1. 退出当前 Claude Code 会话
exit

# 2. 重新启动
claude

# 3. 运行诊断
/doctor

# 应该看到：
# Plugin Errors
#   ✅ No plugin errors detected
```

## 📋 Claude Code 插件加载规则

### 自动加载的文件

Claude Code 插件系统会**自动加载**以下文件：

| 文件路径 | 说明 | 需要声明？ |
|---------|------|-----------|
| `hooks/hooks.json` | Hooks 配置 | ❌ 不需要 |
| `commands/*.md` | Slash 命令 | ✅ 需要在 plugin.json 中声明 |
| `skills/*/` | Skills | ✅ 需要在 plugin.json 中声明 |
| `agents/*.md` | Agents | ✅ 需要在 plugin.json 中声明 |

### plugin.json 配置示例

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "My awesome plugin",

  // ✅ 需要显式声明
  "commands": ["./commands/"],
  "skills": ["./skills/"],
  "agents": ["./agents/agent1.md", "./agents/agent2.md"],

  // ❌ 不需要声明（自动加载）
  // "hooks": "./hooks/hooks.json"
}
```

## 📚 参考文档

- [Claude Code Plugin Documentation](https://docs.anthropic.com/en/docs/claude-code/plugins)
- [Plugin Manifest Reference](https://docs.anthropic.com/en/docs/claude-code/plugins/manifest)

## 🎯 总结

**问题：** plugin.json 中重复声明了 hooks 配置

**原因：** Claude Code 会自动加载 hooks/hooks.json

**解决：** 从 plugin.json 中删除 `"hooks": "./hooks/hooks.json"`

**状态：** ✅ 已修复

**验证：** 运行 `/doctor` 应该不再看到插件错误

---

*修复日期: 2026-01-29*
*问题: Duplicate hooks file detected*
*状态: ✅ 已修复*
