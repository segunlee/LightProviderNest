import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APIModule } from './api/api.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'

const ENV = process.env.NODE_ENV
console.log("API Server Start With Env: " + ENV)

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: !ENV ? '.env.dev' : `.env.${ENV}`
        }),
        AuthModule,
        UsersModule,
        APIModule
    ]
})
export class AppModule { }
