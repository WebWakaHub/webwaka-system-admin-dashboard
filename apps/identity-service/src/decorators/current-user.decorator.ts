import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../common/dto/auth.dto';

/**
 * Decorator to extract the current authenticated user from the request.
 *
 * Usage:
 *   @Get('profile')
 *   @UseGuards(JwtAuthGuard)
 *   async getProfile(@CurrentUser() user: JwtPayload) {
 *     return user;
 *   }
 */
export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext): JwtPayload | any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtPayload;
    return data ? user?.[data] : user;
  },
);
