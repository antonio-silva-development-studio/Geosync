import crypto from 'node:crypto';
import { createServer, type Server } from 'node:net';
import type { PrismaClient } from '@prisma/client';
import { EncryptionService } from './EncryptionService';

interface CLIServerConfig {
  prisma: PrismaClient;
  port?: number;
}

interface CLIRequest {
  method: string;
  params: Record<string, unknown>;
  token?: string;
}

interface CLIResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export class CLIServer {
  private server: Server | null = null;
  private prisma: PrismaClient;
  private port: number;

  constructor(config: CLIServerConfig) {
    this.prisma = config.prisma;
    this.port = config.port || 0; // 0 = random port, or use fixed like 8765
  }

  async start(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.server = createServer((socket) => {
        let buffer = '';

        socket.on('data', async (data) => {
          buffer += data.toString();
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim()) continue;

            try {
              const request: CLIRequest = JSON.parse(line);
              const response = await this.handleRequest(request);
              socket.write(`${JSON.stringify(response)}\n`);
            } catch (error) {
              socket.write(
                `${JSON.stringify({
                  success: false,
                  error: error instanceof Error ? error.message : String(error),
                })}\n`,
              );
            }
          }
        });

        socket.on('error', (error) => {
          console.error('CLI Server socket error:', error);
        });
      });

      this.server.on('error', (error) => {
        console.error('CLI Server error:', error);
        reject(error);
      });

      this.server.listen(this.port, '127.0.0.1', () => {
        const address = this.server?.address();
        const actualPort = typeof address === 'object' && address ? address.port : this.port;
        console.log(`CLI Server listening on port ${actualPort}`);
        resolve(actualPort);
      });
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('CLI Server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  private async handleRequest(request: CLIRequest): Promise<CLIResponse> {
    try {
      switch (request.method) {
        case 'verify_token':
          return await this.verifyToken(request.params.token as string);

        case 'list_projects':
          return await this.listProjects(request.params.tokenId as string);

        case 'get_env_variables':
          return await this.getEnvVariables(
            request.params.tokenId as string,
            request.params.projectId as string,
            request.params.environmentSlug as string,
            request.params.masterKeyHash as string | undefined,
          );

        default:
          return { success: false, error: `Unknown method: ${request.method}` };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async verifyToken(token: string): Promise<CLIResponse> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const accessToken = await this.prisma.accessToken.findUnique({
      where: { tokenHash },
    });

    if (!accessToken) {
      return { success: false, error: 'Invalid token' };
    }

    if (accessToken.expiresAt && new Date(accessToken.expiresAt) < new Date()) {
      return { success: false, error: 'Token expired' };
    }

    await this.prisma.accessToken.update({
      where: { id: accessToken.id },
      data: { lastUsedAt: new Date() },
    });

    return { success: true, data: { tokenId: accessToken.id } };
  }

  private async listProjects(tokenId: string): Promise<CLIResponse> {
    const token = await this.prisma.accessToken.findUnique({ where: { id: tokenId } });
    if (!token || (token.expiresAt && new Date(token.expiresAt) < new Date())) {
      return { success: false, error: 'Invalid or expired token' };
    }

    const projects = await this.prisma.project.findMany({
      include: {
        organization: true,
        environments: true,
      },
    });

    return {
      success: true,
      data: projects.map((p) => ({
        id: p.id,
        name: p.name,
        organization: p.organization?.name || null,
        environments: p.environments.map((e) => ({ id: e.id, name: e.name, slug: e.slug })),
      })),
    };
  }

  private async getEnvVariables(
    tokenId: string,
    projectId: string,
    environmentSlug: string,
    masterKeyHash?: string,
  ): Promise<CLIResponse> {
    const token = await this.prisma.accessToken.findUnique({ where: { id: tokenId } });
    if (!token || (token.expiresAt && new Date(token.expiresAt) < new Date())) {
      return { success: false, error: 'Invalid or expired token' };
    }

    const environment = await this.prisma.environment.findFirst({
      where: {
        projectId,
        slug: environmentSlug,
      },
    });

    if (!environment) {
      return { success: false, error: `Environment "${environmentSlug}" not found` };
    }

    const definitions = await this.prisma.variableDefinition.findMany({ where: { projectId } });
    const values = await this.prisma.variableValue.findMany({
      where: { environmentId: environment.id },
    });

    // If master key is provided, decrypt values
    if (masterKeyHash) {
      const system = await this.prisma.system.findUnique({ where: { id: 'config' } });
      if (!system || system.passwordHash !== masterKeyHash) {
        return { success: false, error: 'Invalid master password' };
      }

      const keyBuffer = Buffer.from(masterKeyHash, 'hex');
      const decryptedVars: Record<string, string> = {};

      for (const def of definitions) {
        const val = values.find((v) => v.definitionId === def.id);
        let decryptedValue = null;

        try {
          if (val) {
            decryptedValue = EncryptionService.decrypt(val.value, keyBuffer);
          } else if (def.defaultValue) {
            decryptedValue = EncryptionService.decrypt(def.defaultValue, keyBuffer);
          }
        } catch (error) {
          console.error('Failed to decrypt value', error);
          decryptedValue = null;
        }

        if (decryptedValue !== null) {
          decryptedVars[def.key] = decryptedValue;
        }
      }

      return { success: true, data: decryptedVars };
    }

    // Otherwise, return structure without values
    return {
      success: true,
      data: {
        environment: {
          id: environment.id,
          name: environment.name,
          slug: environment.slug,
        },
        variables: definitions.map((def) => {
          const val = values.find((v) => v.definitionId === def.id);
          return {
            key: def.key,
            hasValue: !!val,
            isSecret: def.isSecret,
          };
        }),
      },
    };
  }
}
