import { githubAuthApiRef } from '@backstage/core-plugin-api';

export const providers = 
  {
    id: 'github-auth-provider',
    title: 'Local GitHub',
    message: 'Sign in using GitHub',
    apiRef: githubAuthApiRef,
  }
