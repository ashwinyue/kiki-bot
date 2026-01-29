#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

/**
 * 心跳守护进程
 *
 * 定时检查 HEARTBEAT.md 中的任务，并通过通知提醒
 * 使用方法：
 * 1. 启动守护：node custom/scripts/heartbeat-daemon.js start
 * 2. 停止守护：node custom/scripts/heartbeat-daemon.js stop
 * 3. 查看状态：node custom/scripts/heartbeat-daemon.js status
 */

const PID_FILE = path.join(process.env.HOME, '.heartbeat-daemon.pid');
const LOG_FILE = path.join(process.env.HOME, '.heartbeat-daemon.log');

class HeartbeatDaemon {
  constructor(workspace) {
    this.workspace = workspace;
    this.heartbeatPath = path.join(workspace, '.claude/personalities/HEARTBEAT.md');
    this.running = false;
  }

  start(intervalMinutes = 30) {
    if (this.isRunning()) {
      console.log('💓 心跳守护已在运行');
      this.status();
      return;
    }

    const intervalDisplay = intervalMinutes < 1
      ? `${Math.round(intervalMinutes * 60)} 秒`
      : `${intervalMinutes} 分钟`;

    console.log(`💓 启动心跳守护 (间隔: ${intervalDisplay})`);

    const pid = spawn(
      process.argv[0],
      [__filename, 'run', intervalMinutes.toString()],
      {
        detached: true,
        stdio: 'ignore',
        env: { ...process.env, CLAUDE_WORKSPACE: this.workspace }
      }
    );

    fs.writeFileSync(PID_FILE, pid.pid.toString());
    pid.unref();

    console.log('💓 心跳守护已启动');
    console.log(`💓 日志文件: ${LOG_FILE}`);
  }

  stop() {
    if (!fs.existsSync(PID_FILE)) {
      console.log('💓 心跳守护未运行');
      return;
    }

    const pid = parseInt(fs.readFileSync(PID_FILE, 'utf8'));
    try {
      process.kill(pid, 'SIGTERM');
      fs.unlinkSync(PID_FILE);
      console.log('💓 心跳守护已停止');
    } catch (err) {
      console.log('💓 停止失败:', err.message);
      fs.unlinkSync(PID_FILE);
    }
  }

  status() {
    if (!this.isRunning()) {
      console.log('💓 心跳守护未运行');
      return;
    }

    const pid = fs.readFileSync(PID_FILE, 'utf8');
    console.log('💓 心跳守护运行中');
    console.log(`💓 PID: ${pid}`);
    console.log(`💓 日志: ${LOG_FILE}`);
  }

  isRunning() {
    if (!fs.existsSync(PID_FILE)) {
      return false;
    }

    const pid = parseInt(fs.readFileSync(PID_FILE, 'utf8'));
    try {
      process.kill(pid, 0); // 检查进程是否存在
      return true;
    } catch {
      fs.unlinkSync(PID_FILE);
      return false;
    }
  }

  run(intervalMinutes) {
    const interval = intervalMinutes * 60 * 1000;
    const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });

    const log = (msg) => {
      const timestamp = new Date().toISOString();
      logStream.write(`[${timestamp}] ${msg}\n`);
    };

    log('💓 心跳守护启动');

    const checkAndNotify = () => {
      try {
        const tasks = this.checkTasks();

        if (tasks && tasks.all.length > 0) {
          const message = `💓 心跳提醒: ${tasks.all.length} 个待办任务`;

          // macOS 通知
          if (process.platform === 'darwin') {
            spawn('osascript', [
              '-e',
              `display notification "${message}" with title "Everything Claude Code"`
            ]);
          }

          // Linux 通知
          if (process.platform === 'linux') {
            spawn('notify-send', ['Everything Claude Code', message]);
          }

          log(`💓 提醒发送: ${tasks.all.length} 个待办任务`);
        } else {
          log('💓 检查完成: 无待办任务');
        }
      } catch (err) {
        log(`❌ 错误: ${err.message}`);
      }
    };

    // 立即检查一次
    checkAndNotify();

    // 定时检查
    const timer = setInterval(checkAndNotify, interval);

    // 优雅退出
    process.on('SIGTERM', () => {
      clearInterval(timer);
      log('💓 心跳守护停止');
      logStream.close();
      process.exit(0);
    });
  }

  checkTasks() {
    if (!fs.existsSync(this.heartbeatPath)) {
      return null;
    }

    const content = fs.readFileSync(this.heartbeatPath, 'utf8');
    const tasks = {
      all: [],
      bySection: {}
    };

    let currentSection = '未分类';

    for (const line of content.split('\n')) {
      // 检测章节
      if (line.match(/^##\s+/)) {
        currentSection = line.replace(/^##\s+/, '').trim();
        tasks.bySection[currentSection] = [];
        continue;
      }

      // 检测未完成任务
      if (line.match(/^\s*-\s\[\s*\]/)) {
        const task = line.replace(/^\s*-\s\[\s*\]\s*/, '').trim();
        if (task) {
          tasks.all.push({ task, section: currentSection });
          tasks.bySection[currentSection].push(task);
        }
      }
    }

    return tasks;
  }
}

// CLI
if (require.main === module) {
  const workspace = process.env.CLAUDE_WORKSPACE || process.cwd();
  const daemon = new HeartbeatDaemon(workspace);
  const command = process.argv[2];

  switch (command) {
    case 'start':
      const interval = parseFloat(process.argv[3]) || 30;
      daemon.start(interval);
      break;
    case 'stop':
      daemon.stop();
      break;
    case 'status':
      daemon.status();
      break;
    case 'run':
      const runInterval = parseFloat(process.argv[3]) || 30;
      daemon.run(runInterval);
      break;
    default:
      console.log('用法:');
      console.log('  node heartbeat-daemon.js start [间隔(分钟)]');
      console.log('  node heartbeat-daemon.js stop');
      console.log('  node heartbeat-daemon.js status');
      break;
  }
}

module.exports = HeartbeatDaemon;
