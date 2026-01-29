#!/usr/bin/env node
/**
 * Personality Switcher Hook - Dynamic Personality Replacement System
 *
 * Supports ALL personality files:
 * - SOUL.md
 * - AGENTS.md
 * - USER.md
 * - IDENTITY.md
 * - TOOLS.md
 * - HEARTBEAT.md
 *
 * Trigger modes:
 * - Time window (e.g., "evil mode" after 10 PM)
 * - Random chance (e.g., 10% chance for creative mode)
 * - Manual override (via PERSONALITY_MODE env var)
 *
 * IMPORTANT: Does NOT modify files on disk - only replaces in-memory content
 */

const fs = require('fs');
const path = require('path');

class PersonalitySwitcher {
  constructor(workspace) {
    this.workspace = workspace;
    this.personalitiesDir = path.join(workspace, '.claude/personalities');
    this.variantsDir = path.join(workspace, '.claude/personalities-variants');
    this.configPath = path.join(workspace, '.claude/personality-config.json');

    this.personalityFiles = [
      'SOUL.md',
      'AGENTS.md',
      'USER.md',
      'IDENTITY.md',
      'TOOLS.md',
      'HEARTBEAT.md'
    ];

    this.config = this.loadConfig();
  }

  loadConfig() {
    // Default configuration
    const defaultConfig = {
      currentMode: 'default',
      modes: {
        default: {
          description: '默认人格模式',
          priority: 0
        },
        focus: {
          description: '高效专注模式 - 极简输出，直接解决问题',
          priority: 1,
          chance: 0.0,
          timeWindow: null
        },
        creative: {
          description: '创意探索模式 - 提供多种方案，激发灵感',
          priority: 2,
          chance: 0.1, // 10% random chance
          timeWindow: null
        },
        evil: {
          description: '激进模式 - 直接批评，不留情面',
          priority: 3,
          chance: 0.0,
          timeWindow: {
            at: '22:00', // 10 PM
            duration: '2h'
          }
        }
      },
      // Allow overriding files per mode
      modeFiles: {
        focus: ['SOUL.md', 'AGENTS.md'],
        creative: ['SOUL.md', 'AGENTS.md'],
        evil: ['SOUL.md', 'AGENTS.md']
      }
    };

    if (fs.existsSync(this.configPath)) {
      try {
        const userConfig = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
        return { ...defaultConfig, ...userConfig };
      } catch (err) {
        console.error(`[PersonalitySwitcher] Error loading config: ${err.message}`);
        return defaultConfig;
      }
    }

    return defaultConfig;
  }

  decideMode() {
    // 1. Check manual override (environment variable)
    const manualMode = process.env.PERSONALITY_MODE;
    if (manualMode && this.config.modes[manualMode]) {
      return {
        mode: manualMode,
        reason: 'manual',
        source: 'environment variable'
      };
    }

    // 2. Check time windows
    const now = new Date();
    for (const [modeName, modeConfig] of Object.entries(this.config.modes)) {
      if (modeConfig.timeWindow) {
        if (this.isWithinTimeWindow(now, modeConfig.timeWindow)) {
          return {
            mode: modeName,
            reason: 'timeWindow',
            source: `time window: ${modeConfig.timeWindow.at} for ${modeConfig.timeWindow.duration}`
          };
        }
      }
    }

    // 3. Check random chance
    const random = Math.random();
    for (const [modeName, modeConfig] of Object.entries(this.config.modes)) {
      if (modeConfig.chance && modeConfig.chance > 0) {
        if (random < modeConfig.chance) {
          return {
            mode: modeName,
            reason: 'chance',
            source: `random chance: ${(modeConfig.chance * 100).toFixed(1)}%`
          };
        }
      }
    }

    // 4. Default mode
    return {
      mode: 'default',
      reason: 'default',
      source: 'no override specified'
    };
  }

  isWithinTimeWindow(now, timeWindow) {
    if (!timeWindow.at || !timeWindow.duration) {
      return false;
    }

    try {
      const [hour, minute] = timeWindow.at.split(':').map(Number);
      const windowStart = new Date(now);
      windowStart.setHours(hour, minute, 0, 0);

      const durationMs = this.parseDuration(timeWindow.duration);
      const windowEnd = new Date(windowStart.getTime() + durationMs);

      return now >= windowStart && now < windowEnd;
    } catch (err) {
      console.error(`[PersonalitySwitcher] Error checking time window: ${err.message}`);
      return false;
    }
  }

  parseDuration(duration) {
    // Parse duration like "2h", "30m", "1h30m"
    const regex = /(?:(\d+)h)?(?:(\d+)m)?/;
    const match = duration.match(regex);

    if (!match) {
      throw new Error(`Invalid duration format: ${duration}`);
    }

    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);

    return (hours * 60 + minutes) * 60 * 1000;
  }

  switchPersonality() {
    const decision = this.decideMode();
    const mode = decision.mode;

    // If default mode, no replacement needed
    if (mode === 'default') {
      console.error(`[PersonalitySwitcher] Using default personality`);
      return null;
    }

    console.error(`[PersonalitySwitcher] Switching to "${mode}" mode (${decision.reason}: ${decision.source})`);

    // Get files to replace for this mode
    const filesToReplace = this.config.modeFiles[mode] || this.personalityFiles;

    // Build replacement map
    const replacements = {};

    for (const filename of filesToReplace) {
      const variantPath = path.join(this.variantsDir, mode, filename);
      const originalPath = path.join(this.personalitiesDir, filename);

      // Check if variant exists
      if (fs.existsSync(variantPath)) {
        const content = fs.readFileSync(variantPath, 'utf8');
        replacements[filename] = {
          originalPath,
          variantPath,
          content
        };
      } else {
        console.error(`[PersonalitySwitcher] Warning: Variant not found: ${variantPath}`);
      }
    }

    return {
      mode,
      reason: decision.reason,
      source: decision.source,
      replacements
    };
  }

  printSummary() {
    const result = this.switchPersonality();

    if (!result) {
      // Default mode - silent
      return;
    }

    // Only print if mode is switched, keep it minimal
    console.error(`\n💓 [Personality Switcher] ${result.mode} mode (${result.reason})\n`);
  }
}

// Main execution
async function main() {
  const workspace = process.env.CLAUDE_WORKSPACE || process.cwd();
  const switcher = new PersonalitySwitcher(workspace);

  // Print summary to stderr (visible to Claude but doesn't interfere with stdout)
  switcher.printSummary();

  // Exit successfully
  process.exit(0);
}

main().catch(err => {
  console.error(`[PersonalitySwitcher] Error: ${err.message}`);
  process.exit(0); // Don't block session start on errors
});

module.exports = PersonalitySwitcher;
