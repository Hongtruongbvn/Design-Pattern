import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    
    console.log('CurrentUser decorator - user:', user); // Debug
    
    if (!user) {
      return null;
    }
    
    return data ? user[data] : user;
  },
);