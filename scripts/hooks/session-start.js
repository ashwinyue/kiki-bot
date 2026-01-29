#!/usr/bin/env node
/**
 * SessionStart Hook - Load previous context on new session
 *
 * Cross-platform (Windows, macOS, Linux)
 *
 * Runs when a new Claude session starts. Checks for recent session
 * files and notifies Claude of available context to load.
 */

const path = require('path');
const {
  getSessionsDir,
  getLearnedSkillsDir,
  findFiles,
  ensureDir,
  log
} = require('../lib/utils');
const { getPackageManager, getSelectionPrompt } = require('../lib/package-manager');

async function main() {
  const sessionsDir = getSessionsDir();
  const learnedDir = getLearnedSkillsDir();

  // Ensure directories exist
  ensureDir(sessionsDir);
  ensureDir(learnedDir);

  // Check for recent session files (last 7 days)
  // Match both old format (YYYY-MM-DD-session.tmp) and new format (YYYY-MM-DD-shortid-session.tmp)
  const recentSessions = findFiles(sessionsDir, '*-session.tmp', { maxAge: 7 });

  if (recentSessions.length > 0) {
    const latest = recentSessions[0];
    log(`[SessionStart] Found ${recentSessions.length} recent session(s)`);
    log(`[SessionStart] Latest: ${latest.path}`);
  }

  // Check for learned skills
  const learnedSkills = findFiles(learnedDir, '*.md');

  if (learnedSkills.length > 0) {
    log(`[SessionStart] ${learnedSkills.length} learned skill(s) available in ${learnedDir}`);
  }

  // Detect and report package manager
  const pm = getPackageManager();
  log(`[SessionStart] Package manager: ${pm.name} (${pm.source})`);

  // If package manager was detected via fallback, show selection prompt
  if (pm.source === 'fallback' || pm.source === 'default') {
    log('[SessionStart] No package manager preference found.');
    log(getSelectionPrompt());
  }

  // Load personalities and memory (if available)
  try {
    const MemoryManager = require('../../custom/scripts/memory-manager');
    const workspace = process.env.CLAUDE_WORKSPACE || process.cwd();
    const memory = new MemoryManager(workspace);
    memory.init();

    // Load personalities
    const personalities = memory.loadPersonalities();
    if (personalities) {
      console.error('\n========================================');
      console.error('📝 LOADED PERSONALITIES');
      console.error('========================================');
      console.error(personalities);
      console.error('========================================\n');
    }

    // Load global memory
    const globalMemory = memory.loadGlobalMemory();
    if (globalMemory) {
      console.error('\n========================================');
      console.error('🧠 LOADED GLOBAL MEMORY (MEMORY.md)');
      console.error('========================================');
      console.error(globalMemory);
      console.error('========================================\n');
    }

    // Load daily logs
    const todayLog = memory.loadTodayLog();
    if (todayLog) {
      console.error('\n========================================');
      console.error('📅 LOADED DAILY LOGS');
      console.error('========================================');
      console.error(todayLog);
      console.error('========================================\n');
    }

    // Heartbeat reminder
    const HeartbeatMonitor = require('../../custom/scripts/heartbeat');
    const heartbeat = new HeartbeatMonitor(workspace);
    heartbeat.printQuickReminder();
  } catch (err) {
    // Silently skip if memory system is not set up
    if (err.code !== 'MODULE_NOT_FOUND') {
      log('[SessionStart] Memory system not available, skipping...');
    }
  }

  process.exit(0);
}

main().catch(err => {
  console.error('[SessionStart] Error:', err.message);
  process.exit(0); // Don't block on errors
});
