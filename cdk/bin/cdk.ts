#!/usr/bin/env node
import { App } from '@aws-cdk/core';

import { CdkStack } from '../lib/cdk-stack';

const stack = new CdkStack(new App(), 'CdkStack', { description: 'Another aws example project' });