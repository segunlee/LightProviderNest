import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common'
import { ZipEntry } from 'node-stream-zip'
import { ArchiveContent, ArchiveContentMode, ArchiveType } from './model/api.model'


const { promisify } = require('util')
const fs = require('fs')
const stat = promisify(require('fs').stat)
const readdir = promisify(require('fs').readdir)
const junk = require('junk')
const sizeOf = require('buffer-image-size')
const unzip = require('node-stream-zip')
const unrar = require('node-unrar-js')
const pathModule = require('path')

var AllowImageFileExtension = ["BMP", "CUR", "GIF", "ICO", "JPEG", "JPG", "PNG", "PSD", "TIFF", "WebP", "SVG", "DDS"]

@Injectable()
export class APIService {

    absolutePath(path: string): string {
        let basePath = process.env.BASE_PATH
        if (basePath.substr(basePath.length - 1, 1) != '/') {
            basePath = basePath + '/'
        }
        const normalize = pathModule.normalize(basePath + path)
        return normalize
    }

    isFileExist(path: string): boolean {
        try {
            if (!fs.existsSync(path)) {
                return false
            }
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }

    getExtension(filename: string) {
        var ext = pathModule.extname(filename||'').split('.');
        return ext[ext.length - 1];
    }

    async isDirectory(path: string): Promise<boolean> {
        if (!this.isFileExist(path)) {
            return false
        }
        const stats = await stat(path)
        return stats.isDirectory()
    }

    async isFile(path: string): Promise<boolean> {
        if (!this.isFileExist(path)) {
            return false
        }
        const stats = await stat(path)
        return stats.isFile()
    }

    async getFileList(newPath: string): Promise<any[]> {
        console.log(`getFileList | ${newPath}`)

        const returnValue = []
        let fileNames = await readdir(newPath)
        let pathName = newPath
        let relativeFilePath = newPath.replace(process.env.BASE_PATH, '')

        for (let file of fileNames.filter(junk.not)) {
            try {
                let stats = await stat(pathName + '/' + file)
                if (stats.isFile()) {
                    returnValue.push({
                        path: relativeFilePath + '/' + file,
                        name: file,
                        type: file.substring(file.lastIndexOf('.') + 1),
                    })
                } else if (stats.isDirectory()) {
                    returnValue.push({
                        path: relativeFilePath + '/' + file,
                        name: file,
                        type: 'Directory',
                    })
                }
            } catch (error) {
                console.log(`${error}`)
            }
        }

        return returnValue
    }

    async getArchiveFileList(type: ArchiveType, path: string, mode: ArchiveContentMode): Promise<ArchiveContent[]> {
        console.log(`getArchiveFileList | ${type} | ${path} | ${mode}`)

        switch (type) {
            case ArchiveType.zip:
                return this.getZipFileList(path, mode)
            case ArchiveType.rar:
                return this.getRarFileList(path, mode)
            case ArchiveType.cbz:
                return this.getZipFileList(path, mode)
            case ArchiveType.cbr:
                return this.getRarFileList(path, mode)
            default:
                throw new BadRequestException('not supported archive type')
        }
    }

    private async getZipFileList(path: string, mode: ArchiveContentMode): Promise<ArchiveContent[]> {
        const returnValue = []

        try {
            const zip = new unzip.async({ file: path })
            const entries = await zip.entries() as ZipEntry[]
            for (const entry of Object.values(entries)) {

                if (!entry.isFile) {
                    continue
                }

                if (entry.name.includes('__MACOSX/')) {
                    continue
                }

                if (!AllowImageFileExtension.includes(this.getExtension(entry.name).toUpperCase())) {
                    continue
                }

                var dimensions = { width: 0, height: 0 }
                if (mode == ArchiveContentMode.include_size) {
                    const data = await zip.entryData(entry.name)
                    dimensions = sizeOf(data)
                }

                const content: ArchiveContent = {
                    path: path,
                    name: entry.name,
                    type: entry.name.substring(entry.name.lastIndexOf('.') + 1),
                    width: dimensions.width,
                    height: dimensions.height
                }

                returnValue.push(content)
            }

            await zip.close()
        } catch (error) {
            throw new BadRequestException(error + '\n(' + path + ')')
        }

        return returnValue
    }

    private async getRarFileList(path: string, mode: ArchiveContentMode): Promise<ArchiveContent[]> {
        const returnValue = []

        try {
            const data = Uint8Array.from(fs.readFileSync(path)).buffer
            const extractor = await unrar.createExtractorFromData({ data: data })
            var list = await extractor.getFileList()

            const fileNames = []
            for (const header of [...list.fileHeaders]) {
                if (header.name.includes('__MACOSX/')) {
                    continue
                }

                if (!AllowImageFileExtension.includes(this.getExtension(header.name).toUpperCase())) {
                    continue
                }

                fileNames.push(header.name)
            }

            if (mode == ArchiveContentMode.include_size) {
                const extracted = await extractor.extract({ files: fileNames })
                for (const obj of [...extracted.files]) {
                    var buffer = Buffer.from(obj.extraction.buffer)
                    var dimensions = sizeOf(buffer)

                    const content: ArchiveContent = {
                        path: path,
                        name: obj.fileHeader.name,
                        type: obj.fileHeader.name.substring(obj.fileHeader.name.lastIndexOf('.') + 1),
                        width: dimensions.width,
                        height: dimensions.height
                    }
                    returnValue.push(content)
                }
            }
            else {
                for (const name of fileNames) {
                    const content: ArchiveContent = {
                        path: path,
                        name: name,
                        type: name.substring(name.lastIndexOf('.') + 1),
                        width: 0,
                        height: 0
                    }
                    returnValue.push(content)
                }
            }
        } catch (error) {
            throw new BadRequestException(error + '\n(' + path + ')')
        }

        return returnValue
    }

    async responseToPipeOrSend(type: ArchiveType, path: string, filename: string, res: any) {
        console.log(`responseToPipeOrSend | ${type} | ${path} | ${filename}`)

        switch (type) {
            case ArchiveType.zip:
                return this.responseToZipImage(path, filename, res)
            case ArchiveType.rar:
                return this.responseToRarImage(path, filename, res)
            case ArchiveType.cbz:
                return this.responseToZipImage(path, filename, res)
            case ArchiveType.cbr:
                return this.responseToRarImage(path, filename, res)
            default:
                throw new BadRequestException('not supported archive type')
        }
    }

    private async responseToZipImage(path: string, filename: string, res: any) {
        const zip = new unzip.async({ file: path })
        const fileExt = filename.substring(filename.lastIndexOf('.') + 1)
        try {
            res.set('Content-Type', 'image/' + fileExt)
            const stm = await zip.stream(filename)
            stm.pipe(res)
            stm.on('end', () => zip.close())
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST)
            res.send(new BadRequestException(error + '\n(' + path + ')'))
        }
    }

    private async responseToRarImage(path: string, filename: string, res: any) {
        try {
            const data = Uint8Array.from(fs.readFileSync(path)).buffer
            const extractor = await unrar.createExtractorFromData({ data: data })
            const extracted = await extractor.extract({ files: [filename] })
            var obj = [...extracted.files][0]

            const fileExt = filename.substring(filename.lastIndexOf('.') + 1)
            res.set('Content-Type', 'image/' + fileExt)

            var buffer = Buffer.from(obj.extraction.buffer)
            res.send(buffer)
        } catch (error) {
            res.status(HttpStatus.BAD_REQUEST)
            res.send(new BadRequestException(error + '\n(' + path + ')'))
        }
    }

    async generateUniqueIdentifier(path: string): Promise<string> {
        let stats = await stat(path)
        const sum = stats.birthtimeMs + stats.size
        return sum.toString()
    }

    async downloadArchive(path: string, res: any) {
        const data = Uint8Array.from(fs.readFileSync(path)).buffer
        var buffer = Buffer.from(data)
        const fileExt = path.substring(path.lastIndexOf('.') + 1)
        res.set('Content-Type', 'application/' + fileExt)
        res.send(buffer)
    }
}
