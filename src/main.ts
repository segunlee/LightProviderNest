import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    await app.listen(process.env.PORT, () => {
        console.log(`server-started: ${process.env.PORT}`)
        process.send &&
            process.send({
                type: 'SERVER_STARTED',
                message: `Server started at ${process.env.PORT}`,
            })
    })
}
bootstrap()
