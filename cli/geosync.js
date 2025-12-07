#!/usr/bin/env node

/**
 * GeoSync CLI
 *
 * Usage:
 *   geosync run --project="Project Name" --env="dev" -- npm run dev
 *   geosync list-projects
 *   geosync get-env --project="Project Name" --env="dev"
 */

import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createConnection } from 'node:net';
import { homedir } from 'node:os';
import { join } from 'node:path';
import readline from 'node:readline';

const CLI_SERVER_PORT = 8765;
const CLI_SERVER_HOST = '127.0.0.1';

// Config file location
const CONFIG_FILE = join(homedir(), '.geosync', 'config.json');

function loadConfig() {
  try {
    const content = readFileSync(CONFIG_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (_error) {
    return null;
  }
}

function saveConfig(config) {
  const fs = require('node:fs');
  const path = require('node:path');
  const dir = path.dirname(CONFIG_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

async function sendRequest(method, params = {}) {
  return new Promise((resolve, reject) => {
    const socket = createConnection(CLI_SERVER_PORT, CLI_SERVER_HOST, () => {
      const request = `${JSON.stringify({ method, params })}\n`;
      socket.write(request);
    });

    let buffer = '';
    socket.on('data', (data) => {
      buffer += data.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const response = JSON.parse(line);
          socket.end();
          if (response.success) {
            resolve(response.data);
          } else {
            reject(new Error(response.error || 'Request failed'));
          }
        } catch (error) {
          socket.end();
          reject(error);
        }
      }
    });

    socket.on('error', (error) => {
      reject(
        new Error(
          `Failed to connect to GeoSync server. Make sure the app is running. ${error.message}`,
        ),
      );
    });

    socket.setTimeout(5000);
    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error('Connection timeout'));
    });
  });
}

async function getMasterKeyHash() {
  const config = loadConfig();
  if (config?.masterKeyHash) {
    return config.masterKeyHash;
  }

  // Prompt for master password
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('Enter your GeoSync master password: ', (password) => {
      rl.close();
      const hash = createHash('sha256').update(password).digest('hex');

      // Ask if user wants to save it
      const rl2 = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl2.question('Save password hash for this session? (y/N): ', (answer) => {
        rl2.close();
        if (answer.toLowerCase() === 'y') {
          const currentConfig = loadConfig() || {};
          currentConfig.masterKeyHash = hash;
          saveConfig(currentConfig);
        }
        resolve(hash);
      });
    });
  });
}

async function verifyToken(token) {
  try {
    const result = await sendRequest('verify_token', { token });
    return result.tokenId;
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
}

async function listProjects(tokenId) {
  try {
    return await sendRequest('list_projects', { tokenId });
  } catch (error) {
    throw new Error(`Failed to list projects: ${error.message}`);
  }
}

async function getEnvVariables(tokenId, projectId, environmentSlug, masterKeyHash) {
  try {
    return await sendRequest('get_env_variables', {
      tokenId,
      projectId,
      environmentSlug,
      masterKeyHash,
    });
  } catch (error) {
    throw new Error(`Failed to get environment variables: ${error.message}`);
  }
}

function findProjectByName(projects, projectName) {
  return projects.find((p) => p.name.toLowerCase() === projectName.toLowerCase());
}

function findEnvironmentBySlug(environments, envSlug) {
  return environments.find((e) => e.slug.toLowerCase() === envSlug.toLowerCase());
}

async function runCommand(args) {
  const command = args[0];

  switch (command) {
    case 'run': {
      // Parse: geosync run --project="Name" --env="dev" -- npm run dev
      const projectIndex = args.indexOf('--project');
      const envIndex = args.indexOf('--env');
      const separatorIndex = args.indexOf('--');

      if (projectIndex === -1 || envIndex === -1 || separatorIndex === -1) {
        console.error('Usage: geosync run --project="Project Name" --env="dev" -- <command>');
        process.exit(1);
      }

      const projectName = args[projectIndex + 1]?.replace(/^["']|["']$/g, '');
      const envSlug = args[envIndex + 1]?.replace(/^["']|["']$/g, '');
      const commandArgs = args.slice(separatorIndex + 1);

      if (!commandArgs.length) {
        console.error('No command provided after --');
        process.exit(1);
      }

      // Get token from config or env
      const config = loadConfig();
      const token = process.env.GEOSYNC_TOKEN || config?.token;
      if (!token) {
        console.error(
          'No access token found. Set GEOSYNC_TOKEN env var or configure in ~/.geosync/config.json',
        );
        console.error('Generate a token in GeoSync: Settings > Developer Tools');
        process.exit(1);
      }

      const tokenId = await verifyToken(token);
      const projects = await listProjects(tokenId);
      const project = findProjectByName(projects, projectName);

      if (!project) {
        console.error(`Project "${projectName}" not found`);
        console.error('Available projects:', projects.map((p) => p.name).join(', '));
        process.exit(1);
      }

      const environment = findEnvironmentBySlug(project.environments, envSlug);
      if (!environment) {
        console.error(`Environment "${envSlug}" not found in project "${projectName}"`);
        console.error(
          'Available environments:',
          project.environments.map((e) => e.slug).join(', '),
        );
        process.exit(1);
      }

      const masterKeyHash = await getMasterKeyHash();
      const variables = await getEnvVariables(tokenId, project.id, environment.slug, masterKeyHash);

      // Set environment variables and run command
      const [cmd, ...cmdArgs] = commandArgs;
      const proc = spawn(cmd, cmdArgs, {
        stdio: 'inherit',
        env: {
          ...process.env,
          ...variables,
        },
      });

      proc.on('exit', (code) => {
        process.exit(code || 0);
      });
      break;
    }

    case 'list-projects': {
      const config = loadConfig();
      const token = process.env.GEOSYNC_TOKEN || config?.token;
      if (!token) {
        console.error(
          'No access token found. Set GEOSYNC_TOKEN env var or configure in ~/.geosync/config.json',
        );
        process.exit(1);
      }

      const tokenId = await verifyToken(token);
      const projects = await listProjects(tokenId);

      console.log('\nProjects:');
      projects.forEach((project) => {
        console.log(
          `  - ${project.name}${project.organization ? ` (${project.organization})` : ''}`,
        );
        project.environments.forEach((env) => {
          console.log(`    └─ ${env.slug}`);
        });
      });
      break;
    }

    case 'get-env': {
      const projectIndex = args.indexOf('--project');
      const envIndex = args.indexOf('--env');

      if (projectIndex === -1 || envIndex === -1) {
        console.error('Usage: geosync get-env --project="Project Name" --env="dev"');
        process.exit(1);
      }

      const projectName = args[projectIndex + 1]?.replace(/^["']|["']$/g, '');
      const envSlug = args[envIndex + 1]?.replace(/^["']|["']$/g, '');

      const config = loadConfig();
      const token = process.env.GEOSYNC_TOKEN || config?.token;
      if (!token) {
        console.error(
          'No access token found. Set GEOSYNC_TOKEN env var or configure in ~/.geosync/config.json',
        );
        process.exit(1);
      }

      const tokenId = await verifyToken(token);
      const projects = await listProjects(tokenId);
      const project = findProjectByName(projects, projectName);

      if (!project) {
        console.error(`Project "${projectName}" not found`);
        process.exit(1);
      }

      const environment = findEnvironmentBySlug(project.environments, envSlug);
      if (!environment) {
        console.error(`Environment "${envSlug}" not found`);
        process.exit(1);
      }

      const masterKeyHash = await getMasterKeyHash();
      const variables = await getEnvVariables(tokenId, project.id, environment.slug, masterKeyHash);

      // Output as .env format
      Object.entries(variables).forEach(([key, value]) => {
        console.log(`${key}=${value}`);
      });
      break;
    }

    case 'config': {
      const subcommand = args[1];
      if (subcommand === 'set-token') {
        const token = args[2];
        if (!token) {
          console.error('Usage: geosync config set-token <token>');
          process.exit(1);
        }
        const config = loadConfig() || {};
        config.token = token;
        saveConfig(config);
        console.log('Token saved to ~/.geosync/config.json');
      } else {
        console.error('Usage: geosync config set-token <token>');
        process.exit(1);
      }
      break;
    }

    default:
      console.log(`
GeoSync CLI

Usage:
  geosync run --project="Project Name" --env="dev" -- <command>
    Run a command with environment variables injected

  geosync list-projects
    List all available projects and environments

  geosync get-env --project="Project Name" --env="dev"
    Output environment variables in .env format

  geosync config set-token <token>
    Save access token to config file

Environment Variables:
  GEOSYNC_TOKEN    Access token (alternative to config file)

Examples:
  geosync run --project="My App" --env="dev" -- npm run dev
  geosync get-env --project="My App" --env="prod" > .env.production
      `);
      process.exit(1);
  }
}

// Main
const args = process.argv.slice(2);
runCommand(args).catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
