#!/usr/bin/env node
import { App } from 'aws-cdk-lib';

import { CdkStack } from '../lib/cdk-stack';

const stack = new CdkStack(new App(), 'CdkStack', { description: 'Another aws example project' });