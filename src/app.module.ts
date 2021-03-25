import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APIModule } from './api/api.module';

const ENV = process.env.NODE_ENV;

console.log(ENV)

@Module({
    imports: [
        ConfigModule.forRoot({ 
            isGlobal: true, 
            envFilePath: !ENV ? '.env.dev' : `.env.${ENV}`
        }),
        APIModule
    ]
})
export class AppModule { }
