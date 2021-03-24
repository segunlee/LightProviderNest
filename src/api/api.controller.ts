import { BadRequestException, Controller, Get, Query, Response } from '@nestjs/common'
import { APIService } from './api.service'
import { ArchiveContentMode, ArchiveType } from './model/api.model'

@Controller('api')
export class APIController {
    constructor(private service: APIService) { }

    @Get('list')
    async filetree(
        @Query('path') path: string = '') {

        console.log(process.env.DATABASE_USER)

        if (path == '') {
            throw new BadRequestException(`필수값이 누락되었습니다.`)
        }

        if (!this.service.isDirectory(path)) {
            throw new BadRequestException(`디렉토리가 아닙니다.`)
        }

        const list = await this.service.getFileList(path)

        return Object.assign({
            list: list,
            statusCode: 200,
            message: `데이터 조회가 성공적으로 완료되었습니다.`
        })
    }

    @Get('archive/list')
    async getArchiveFileContents(
        @Query('type') type: string = '',
        @Query('path') path: string = '',
        @Query('mode') mode: ArchiveContentMode = ArchiveContentMode.none) {

        if (type == '' || path == '') {
            throw new BadRequestException(`필수값이 누락되었습니다.`)
        }

        if (!await this.service.isFile(path)) {
            throw new BadRequestException(`파일이 아닙니다.`)
        }

        const enumType = type.toLowerCase() as ArchiveType
        const list = await this.service.getArchiveFileList(enumType, path, mode)

        return Object.assign({
            list: list,
            statusCode: 200,
            message: `데이터 조회가 성공적으로 완료되었습니다.`
        })
    }

    @Get('archive/image')
    async getImageFromArchiveContents(
        @Response() res: any,
        @Query('type') type: string = '',
        @Query('path') path: string = '',
        @Query('filename') filename: string = '') {

        if (type == '' || path == '' || filename == '') {
            throw new BadRequestException(`필수값이 누락되었습니다.`)
        }

        if (!await this.service.isFile(path)) {
            throw new BadRequestException(`파일이 아닙니다`)
        }

        const enumType = type.toLowerCase() as ArchiveType
        this.service.responseToPipeOrSend(enumType, path, filename, res)
    }

    @Get('uniqueidentifier')
    async generateUniqueIdentifier(
        @Query('path') path: string = '') {

        if (path == '') {
            throw new BadRequestException(`필수값이 누락되었습니다.`)
        }

        if (!await this.service.isFile(path)) {
            throw new BadRequestException(`파일이 아닙니다`)
        }

        const identifier = await this.service.generateUniqueIdentifier(path)
        console.log("uniqueue_identifier: " + identifier)

        return Object.assign({
            uniqueIdentifier: identifier,
            statusCode: 200,
            message: `정상 처리되었습니다.`
        })
    }

    @Get('archive/download')
    async downloadArchive(
        @Response() res: any,
        @Query('path') path: string = '') {

        if (path == '') {
            throw new BadRequestException(`필수값이 누락되었습니다.`)
        }

        if (!await this.service.isFile(path)) {
            throw new BadRequestException(`파일이 아닙니다`)
        }

        this.service.downloadArchive(path, res)
    }
}
