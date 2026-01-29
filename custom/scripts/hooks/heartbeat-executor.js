#!/usr/bin/env node
/**
 * Heartbeat Executor Hook - 执行 HEARTBEAT.md 任务并发送通知
 *
 * 功能：
 * 1. SessionStart: 显示今日任务概览
 * 2. SessionEnd: 提醒未完成任务
 * 3. 主动发送系统通知（重要事项）
 * 4. 支持任务执行（自动执行可执行的任务）
 *
 * 使用方法：
 * - 集成到 hooks.json 的 SessionStart 和 SessionEnd
 * - 通过环境变量控制行为（HEARTBEAT_MODE=session/start/end）
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class HeartbeatExecutor {
  constructor(workspace) {
    this.workspace = workspace;
    this.heartbeatPath = path.join(workspace, '.claude/personalities/HEARTBEAT.md');
    this.statePath = path.join(workspace, '.claude/.heartbeat-state.json');
    this.today = new Date().toISOString().split('T')[0];
    this.mode = process.env.HEARTBEAT_MODE || 'session';
  }

  /**
   * 主执行函数
   */
  async execute() {
    const tasks = this.parseHeartbeat();

    if (!tasks) {
      return;
    }

    switch (this.mode) {
      case 'start':
        await this.onSessionStart(tasks);
        break;
      case 'end':
        await this.onSessionEnd(tasks);
        break;
      case 'session':
      default:
        await this.onSessionStart(tasks);
        break;
    }
  }

  /**
   * 解析 HEARTBEAT.md 文件
   */
  parseHeartbeat() {
    if (!fs.existsSync(this.heartbeatPath)) {
      console.error('💓 HEARTBEAT: 未找到 HEARTBEAT.md');
      return null;
    }

    const content = fs.readFileSync(this.heartbeatPath, 'utf8');
    const lines = content.split('\n');

    const tasks = {
      scheduled: [],
      daily: [],
      weekly: [],
      ongoing: [],
      memory: [],
      all: []
    };

    let currentSection = null;

    for (const line of lines) {
      // 检测章节标题
      if (line.match(/^##\s+/)) {
        const title = line.replace(/^##\s+/, '').trim();

        if (title.includes('定时提醒') || title.includes('Scheduled')) {
          currentSection = 'scheduled';
        } else if (title.includes('每日检查') || title.includes('Daily')) {
          currentSection = 'daily';
        } else if (title.includes('每周检查') || title.includes('Weekly')) {
          currentSection = 'weekly';
        } else if (title.includes('持续关注') || title.includes('Ongoing')) {
          currentSection = 'ongoing';
        } else if (title.includes('记忆维护') || title.includes('Memory')) {
          currentSection = 'memory';
        } else {
          currentSection = null;
        }
        continue;
      }

      // 检测未完成任务
      if (line.match(/^\s*-\s\[\s*\]/)) {
        const task = line.replace(/^\s*-\s\[\s*\]\s*/, '').trim();
        if (task) {
          if (currentSection && tasks[currentSection]) {
            tasks[currentSection].push({
              text: task,
              section: currentSection
            });
          }
          tasks.all.push({
            text: task,
            section: currentSection || '未分类'
          });
        }
      }
    }

    return tasks;
  }

  /**
   * 加载状态（用于跟踪每日任务完成情况）
   */
  loadState() {
    if (fs.existsSync(this.statePath)) {
      try {
        return JSON.parse(fs.readFileSync(this.statePath, 'utf8'));
      } catch (err) {
        return {};
      }
    }
    return {};
  }

  /**
   * 保存状态
   */
  saveState(state) {
    fs.writeFileSync(this.statePath, JSON.stringify(state, null, 2), 'utf8');
  }

  /**
   * 会话开始时的处理
   */
  async onSessionStart(tasks) {
    const state = this.loadState();
    const lastSession = state.lastSessionDate;

    // 如果是今天第一次会话，显示完整概览
    if (lastSession !== this.today) {
      console.error('\n' + '='.repeat(70));
      console.error('💓 HEARTBEAT - 今日任务概览');
      console.error('='.repeat(70));
      console.error(`📅 日期: ${this.today}\n`);

      this.printSection('⏰ 定时提醒', tasks.scheduled);
      this.printSection('📅 每日检查', tasks.daily);
      this.printSection('📆 每周检查', tasks.weekly);
      this.printSection('🔄 持续关注', tasks.ongoing);
      this.printSection('🧠 记忆维护', tasks.memory);

      console.error('='.repeat(70));
      console.error(`💡 提示: 使用 "node custom/scripts/heartbeat.js" 查看完整任务列表`);
      console.error('='.repeat(70) + '\n');

      // 发送系统通知
      if (tasks.all.length > 0) {
        await this.sendNotification(
          `💓 今日有 ${tasks.all.length} 个待办任务`,
          `打开 HEARTBEAT.md 查看详情`
        );
      }
    } else {
      // 同一天的后续会话，只显示快速提醒
      const pendingCount = tasks.all.length;
      if (pendingCount > 0) {
        console.error(`\n💓 HEARTBEAT: ${pendingCount} 个待办任务\n`);
      }
    }

    // 更新状态
    state.lastSessionDate = this.today;
    this.saveState(state);
  }

  /**
   * 会话结束时的处理
   */
  async onSessionEnd(tasks) {
    const pendingCount = tasks.all.length;

    if (pendingCount === 0) {
      console.error('\n✅ HEARTBEAT: 所有任务已完成！\n');
      return;
    }

    console.error('\n' + '='.repeat(70));
    console.error('💓 HEARTBEAT - 会话结束提醒');
    console.error('='.repeat(70));
    console.error(`📊 还有 ${pendingCount} 个待办任务未完成\n`);

    // 显示高优先级任务
    const priorityTasks = tasks.daily.slice(0, 3);
    if (priorityTasks.length > 0) {
      console.error('🔴 高优先级任务（每日检查）:');
      priorityTasks.forEach((task, i) => {
        console.error(`  ${i + 1}. ${task.text}`);
      });
      console.error('');
    }

    console.error('='.repeat(70));
    console.error(`💡 下次会话时将再次提醒`);
    console.error('='.repeat(70) + '\n');

    // 发送系统通知（仅在仍有重要任务时）
    if (tasks.daily.length > 0) {
      await this.sendNotification(
        `💓 还有 ${tasks.daily.length} 个每日任务未完成`,
        tasks.daily[0].text.substring(0, 50)
      );
    }
  }

  /**
   * 打印任务分组
   */
  printSection(title, tasks) {
    if (tasks.length === 0) {
      return;
    }

    console.error(`${title}`);
    console.error('-'.repeat(70));

    tasks.forEach((task, i) => {
      const checkbox = '[ ]';
      console.error(`  ${checkbox} ${task.text}`);
    });

    console.error('');
  }

  /**
   * 发送系统通知
   */
  async sendNotification(title, message) {
    const platform = process.platform;

    try {
      if (platform === 'darwin') {
        // macOS 通知
        spawn('osascript', [
          '-e',
          `display notification "${message.replace(/"/g, '\\"')}" with title "${title.replace(/"/g, '\\"')}"`
        ]);
      } else if (platform === 'linux') {
        // Linux 通知
        spawn('notify-send', [title, message]);
      } else if (platform === 'win32') {
        // Windows 通知（使用 PowerShell）
        spawn('powershell', [
          '-Command',
          `[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime]::CreateToastNotifier("${title}").Show(${message})`
        ]);
      }
    } catch (err) {
      // 静默失败，不影响主流程
      console.error(`💓 通知发送失败: ${err.message}`);
    }
  }

  /**
   * 执行任务（支持可执行的任务）
   */
  async executeTask(task) {
    // 检测任务中是否包含命令
    const commandMatch = task.text.match(/`([^`]+)`/);

    if (commandMatch) {
      const command = commandMatch[1];
      console.error(`\n💓 执行任务: ${task.text}`);
      console.error(`💓 命令: ${command}\n`);

      try {
        // 在后台执行命令
        spawn('sh', ['-c', command], {
          cwd: this.workspace,
          detached: true,
          stdio: 'ignore'
        }).unref();

        await this.sendNotification(
          '💓 任务已执行',
          task.text.substring(0, 50)
        );
      } catch (err) {
        console.error(`❌ 任务执行失败: ${err.message}\n`);
      }
    }
  }

  /**
   * 打印快速提醒（用于其他 hook 调用）
   */
  printQuickReminder() {
    const tasks = this.parseHeartbeat();

    if (!tasks || tasks.all.length === 0) {
      return;
    }

    console.error(`\n💓 HEARTBEAT: ${tasks.all.length} 个待办任务在 HEARTBEAT.md 中\n`);
  }
}

// 主执行
async function main() {
  const workspace = process.env.CLAUDE_WORKSPACE || process.cwd();
  const executor = new HeartbeatExecutor(workspace);

  await executor.execute();

  process.exit(0);
}

// CLI 调用
if (require.main === module) {
  main().catch(err => {
    console.error(`[HeartbeatExecutor] Error: ${err.message}`);
    process.exit(0);
  });
}

module.exports = HeartbeatExecutor;
