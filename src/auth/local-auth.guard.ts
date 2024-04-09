import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
// 'local' dùng để liên kết đến passport-local package đã được cung cấp
export class LocalAuthGuard extends AuthGuard('local') {}
