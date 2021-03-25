import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { APIController } from './api.controller';
import { APIService } from './api.service';

@Module({
    imports: [AuthModule],
    providers: [APIService],
    controllers: [APIController]
})
export class APIModule { }
