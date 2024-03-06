import { CatalogBuilder } from '@backstage/plugin-catalog-backend';
import { ScaffolderEntitiesProcessor } from '@backstage/plugin-catalog-backend-module-scaffolder-entity-model';
import { Router } from 'express';
import { PluginEnvironment } from '../types';

import { GithubOrgEntityProvider, defaultUserTransformer } from '@backstage/plugin-catalog-backend-module-github';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const builder = await CatalogBuilder.create(env);

  // The org URL below needs to match a configured integrations.github entry
  // specified in your app-config.
  builder.addEntityProvider(
    GithubOrgEntityProvider.fromConfig(env.config, {
      id: 'development',
      orgUrl: 'https://github.com',
      logger: env.logger,
      schedule: env.scheduler.createScheduledTaskRunner({
        frequency: { minutes: 60 },
        timeout: { minutes: 15 },
      }),
      userTransformer: async (user, ctx) => {
        const entity = await defaultUserTransformer(user, ctx);
        if (entity && user.organizationVerifiedDomainEmails?.length) {
          entity.spec.profile!.email = user.organizationVerifiedDomainEmails[0];
        }
        return entity;
      },
    }),
  );
  builder.addProcessor(new ScaffolderEntitiesProcessor());
  const { processingEngine, router } = await builder.build();
  await processingEngine.start();
  return router;
}

// export default async function createPlugin(
//   env: PluginEnvironment,
// ): Promise<Router> {
//   const builder = await CatalogBuilder.create(env);
//   builder.addProcessor(new ScaffolderEntitiesProcessor());
//   const { processingEngine, router } = await builder.build();
//   await processingEngine.start();
//   return router;
// }
