#!/bin/bash
# 清理插件缓存并重新加载

echo "🧹 清理 Claude Code 插件缓存"
echo "================================"
echo ""

# 1. 停止 Claude Code（如果在运行）
echo "1️⃣ 请先退出 Claude Code (输入: exit)"
echo ""

# 2. 清理缓存
echo "2️⃣ 清理插件缓存..."
rm -rf ~/.claude/plugins/cache/everything-claude-code
echo "   ✅ 缓存已清理"
echo ""

# 3. 删除安装记录（强制重新安装）
echo "3️⃣ 重置插件安装记录..."
# 备份
cp ~/.claude/plugins/installed_plugins.json ~/.claude/plugins/installed_plugins.json.backup

# 从安装记录中移除 everything-claude-code
python3 << 'PYTHON'
import json
import os

config_path = os.path.expanduser("~/.claude/plugins/installed_plugins.json")

if os.path.exists(config_path):
    with open(config_path, 'r') as f:
        data = json.load(f)

    if 'plugins' in data and 'everything-claude-code' in data['plugins']:
        del data['plugins']['everything-claude-code']
        with open(config_path, 'w') as f:
            json.dump(data, f, indent=2)
        print("   ✅ 插件记录已重置")
    else:
        print("   ℹ️  插件未在安装记录中")
else:
    print("   ⚠️  安装记录文件不存在")
PYTHON

echo ""
echo "4️⃣ 重新启动 Claude Code"
echo "   claude"
echo ""
echo "5️⃣ 重新安装插件"
echo "   /plugin install file://$(pwd)"
echo ""
echo "6️⃣ 运行诊断"
echo "   /doctor"
echo ""
echo "================================"
echo "✅ 清理完成！"
