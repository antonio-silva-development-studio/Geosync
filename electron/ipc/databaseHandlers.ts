import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import type { PrismaClient as PrismaClientType } from '@prisma/client';
import { app, dialog, ipcMain } from 'electron';

const require = createRequire(import.meta.url);
const { PrismaClient } = require('@prisma/client') as { PrismaClient: typeof PrismaClientType };

import { EncryptionService } from '../services/EncryptionService';

const dbPath = path.join(app.getPath('userData'), 'geosync.db');

// Initialize DB if it doesn't exist
function getSkeletonPath() {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'skeleton.db')
    : path.join(__dirname, '../../prisma/skeleton.db'); // Adjust for dev structure
}

if (!fs.existsSync(dbPath)) {
  const skeletonPath = getSkeletonPath();
  if (fs.existsSync(skeletonPath)) {
    try {
      fs.copyFileSync(skeletonPath, dbPath);
      console.log('Initialized database from skeleton');
    } catch (e) {
      console.error('Failed to copy skeleton database', e);
      dialog.showErrorBox('Initialization Error', 'Failed to initialize database.');
    }
  } else {
    console.warn('Skeleton database not found at', skeletonPath);
  }
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${dbPath}`,
    },
  },
});

// Self-healing: Check if tables exist
(async () => {
  try {
    await prisma.system.findFirst();
  } catch (error) {
    const msg = String(error);
    if (msg.includes('no such table') || msg.includes('does not exist')) {
      console.warn('Database missing tables. Attempting to repair from skeleton...');
      try {
        await prisma.$disconnect();
        const skeletonPath = getSkeletonPath();
        if (fs.existsSync(skeletonPath)) {
          fs.copyFileSync(skeletonPath, dbPath);
          console.log('Database repaired from skeleton');
          await prisma.$connect();
        }
      } catch (repairError) {
        console.error('Failed to repair database:', repairError);
        dialog.showErrorBox(
          'Database Error',
          'Database corrupted and repair failed. Please reinstall the application.',
        );
      }
    }
  }
})();

export function registerDatabaseHandlers() {
  // System/Auth Handlers
  ipcMain.handle('db:is-configured', async () => {
    try {
      const config = await prisma.system.findUnique({ where: { id: 'config' } });
      return !!config;
    } catch (error) {
      dialog.showErrorBox(
        'Database Error',
        `Failed to check configuration: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  });

  ipcMain.handle('db:set-master-password', async (_, passwordHash) => {
    try {
      return await prisma.system.create({
        data: { id: 'config', passwordHash },
      });
    } catch (error) {
      console.error('Failed to set master password:', error);
      dialog.showErrorBox(
        'Database Error',
        `Failed to create master password: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  });

  ipcMain.handle('db:verify-master-password', async (_, hash) => {
    const config = await prisma.system.findUnique({ where: { id: 'config' } });
    if (config && config.passwordHash === hash) {
      return {
        valid: true,
        user: {
          name: config.name,
          email: config.email,
        },
      };
    }
    return { valid: false };
  });

  ipcMain.handle('db:update-system-profile', async (_, data) => {
    return await prisma.system.update({
      where: { id: 'config' },
      data,
    });
  });

  ipcMain.handle('db:change-master-password', async (_, { oldHash, newHash }) => {
    const config = await prisma.system.findUnique({ where: { id: 'config' } });
    if (!config || config.passwordHash !== oldHash) {
      throw new Error('Invalid current password');
    }
    await prisma.system.update({
      where: { id: 'config' },
      data: { passwordHash: newHash },
    });
    return true;
  });

  // Organization Handlers
  ipcMain.handle('db:get-organizations', async () => {
    return await prisma.organization.findMany();
  });

  ipcMain.handle('db:create-organization', async (_, data) => {
    return await prisma.organization.create({ data });
  });

  // Project Handlers
  ipcMain.handle('db:get-projects', async (_, organizationId) => {
    if (!organizationId) return [];
    return await prisma.project.findMany({ where: { organizationId } });
  });

  ipcMain.handle('db:create-project', async (_, data) => {
    return await prisma.project.create({ data });
  });

  ipcMain.handle('db:delete-project', async (_, id) => {
    return await prisma.project.delete({ where: { id } });
  });

  // Environment Handlers
  ipcMain.handle('db:get-environments', async (_, projectId) => {
    return await prisma.environment.findMany({ where: { projectId } });
  });

  ipcMain.handle('db:create-environment', async (_, data) => {
    return await prisma.environment.create({ data });
  });

  ipcMain.handle('db:update-environment', async (_, { id, data }) => {
    return await prisma.environment.update({
      where: { id },
      data,
    });
  });

  ipcMain.handle('db:delete-environment', async (_, id) => {
    return await prisma.environment.delete({ where: { id } });
  });

  // Variable Handlers
  ipcMain.handle(
    'db:save-variable-definition',
    async (_, { projectId, key, description, defaultValue, isSecret, masterKey }) => {
      let encryptedDefaultValue = null;
      if (defaultValue) {
        const keyBuffer = Buffer.from(masterKey, 'hex'); // Assuming masterKey is passed as hex string
        encryptedDefaultValue = EncryptionService.encrypt(defaultValue, keyBuffer);
      }

      return await prisma.variableDefinition.upsert({
        where: { projectId_key: { projectId, key } },
        update: { description, defaultValue: encryptedDefaultValue, isSecret },
        create: { projectId, key, description, defaultValue: encryptedDefaultValue, isSecret },
      });
    },
  );

  ipcMain.handle('db:delete-variable-definition', async (_, id) => {
    return await prisma.variableDefinition.delete({ where: { id } });
  });

  ipcMain.handle(
    'db:save-variable-value',
    async (_, { environmentId, definitionId, value, masterKey }) => {
      const keyBuffer = Buffer.from(masterKey, 'hex');
      const encryptedValue = EncryptionService.encrypt(value, keyBuffer);

      return await prisma.variableValue.upsert({
        where: { environmentId_definitionId: { environmentId, definitionId } },
        update: { value: encryptedValue },
        create: { environmentId, definitionId, value: encryptedValue },
      });
    },
  );

  ipcMain.handle('db:delete-variable-value', async (_, { environmentId, definitionId }) => {
    return await prisma.variableValue.deleteMany({
      where: {
        environmentId,
        definitionId,
      },
    });
  });

  ipcMain.handle('db:get-variables', async (_, { projectId, environmentId, masterKey }) => {
    const definitions = await prisma.variableDefinition.findMany({ where: { projectId } });
    const values = await prisma.variableValue.findMany({ where: { environmentId } });

    const keyBuffer = Buffer.from(masterKey, 'hex');

    return definitions.map((def: { id: string; defaultValue: string | null }) => {
      const val = values.find((v: { definitionId: string }) => v.definitionId === def.id);
      let decryptedValue = null;

      try {
        if (val) {
          decryptedValue = EncryptionService.decrypt(val.value, keyBuffer);
        } else if (def.defaultValue) {
          decryptedValue = EncryptionService.decrypt(def.defaultValue, keyBuffer);
        }
      } catch (error) {
        console.error('Failed to decrypt value', error);
        decryptedValue = '<<DECRYPTION FAILED>>';
      }

      return {
        ...def,
        value: decryptedValue,
        isOverridden: !!val,
      };
    });
  });
  // Document Handlers
  ipcMain.handle('db:get-documents', async (_, projectId) => {
    return await prisma.document.findMany({ where: { projectId } });
  });

  ipcMain.handle('db:create-document', async (_, data) => {
    return await prisma.document.create({ data });
  });

  ipcMain.handle('db:update-document', async (_, { id, data }) => {
    return await prisma.document.update({
      where: { id },
      data,
    });
  });

  ipcMain.handle('db:delete-document', async (_, id) => {
    return await prisma.document.delete({ where: { id } });
  });
}
