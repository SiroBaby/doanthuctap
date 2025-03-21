import { Module } from '@nestjs/common';
import { ClerkAuthGuard } from './clerk-auth.guard';
import { GqlClerkAuthGuard } from './gql-clerk-auth.guard';
import { Roles } from './clerk-auth.guard';

@Module({
  providers: [ClerkAuthGuard, GqlClerkAuthGuard],
  exports: [ClerkAuthGuard, GqlClerkAuthGuard, Roles],
})
export class AuthModule {} 