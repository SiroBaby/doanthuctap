import { clerkClient } from '@clerk/clerk-sdk-node';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma.service';
import { Role } from '@prisma/client';
import { ROLES_KEY } from './clerk-auth.guard';

@Injectable()
export class GqlClerkAuthGuard implements CanActivate {
    private readonly logger = new Logger(GqlClerkAuthGuard.name);

    constructor(
        private prisma: PrismaService,
        private reflector: Reflector
    ) { }

    async canActivate(context: ExecutionContext) {
        // Convert để lấy context GraphQL
        const gqlContext = GqlExecutionContext.create(context);
        const { req } = gqlContext.getContext();

        // Lấy các roles được yêu cầu từ decorator
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        try {
            // Xác thực token Clerk
            const sessionToken = req.cookies.__session;
            if (!sessionToken) {
                this.logger.error('No session token found');
                return false;
            }

            const tokenVerification = await clerkClient.verifyToken(sessionToken);

            // Lấy user ID từ token
            const userId = tokenVerification.sub;

            // Set user ID in request object so it can be accessed in resolvers
            if (!req.user) {
                req.user = { id: userId };
            }

            // Nếu không có yêu cầu về role, chỉ cần xác thực thành công là đủ
            if (!requiredRoles || requiredRoles.length === 0) {
                return true;
            }

            // Truy vấn database để lấy role của user
            const user = await this.prisma.user.findUnique({
                where: { id_user: userId }
            });

            if (!user) {
                this.logger.error(`User with ID ${userId} not found in database`);
                return false;
            }

            // Kiểm tra role
            return requiredRoles.includes(user.role);
        } catch (error) {
            this.logger.error('Clerk authentication failed', error);
            return false;
        }
    }
} 