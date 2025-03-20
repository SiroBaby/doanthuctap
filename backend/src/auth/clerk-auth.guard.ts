import { clerkClient } from '@clerk/clerk-sdk-node';
import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma.service';
import { Role } from '@prisma/client';

// Role enum đã được định nghĩa sẵn từ Prisma
export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class ClerkAuthGuard implements CanActivate {
    private readonly logger = new Logger(ClerkAuthGuard.name);
    
    constructor(
        private prisma: PrismaService,
        private reflector: Reflector
    ) {}
    
    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        
        // Lấy các roles được yêu cầu từ decorator
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        try {
            // Xác thực token Clerk
            const tokenVerification = await clerkClient.verifyToken(request.cookies.__session);
            
            // Nếu không có yêu cầu về role, chỉ cần xác thực thành công là đủ
            if (!requiredRoles || requiredRoles.length === 0) {
                return true;
            }
            
            // Lấy user ID từ token
            const userId = tokenVerification.sub;
            
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

