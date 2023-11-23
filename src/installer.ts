import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import path from 'path'
import fs from 'fs'

const MACOS_JAVA_CONTENT_POSTFIX = 'Contents/Home'
export interface MavenOptions {
  mavenFile: string
  url: string
  mavenVersion: string
}

export async function installExtractedMaven(
  mavenFile: string,
  mavenVersion: string
) {
  let toolPath = tc.find('maven', mavenVersion)
  if (toolPath) {
    core.info(`Resolved Maven ${mavenVersion} from tool-cache`)
  } else {
    core.info(
      `Maven ${mavenVersion} was not found in tool-cache, Trying to unpack from ${mavenFile}`
    )
    if (!mavenFile) {
      throw new Error('mavenFile is not specified')
    }
    const mavenFilePath = path.resolve(mavenFile)
    const stats = fs.statSync(mavenFilePath)
    if (!stats.isFile()) {
      throw new Error(`maven file was not found in path ${mavenFilePath}`)
    }
    core.info(`Extracting Maven from  ${mavenFilePath}`)
    const extractedMavenPath = await extractMaven(mavenFilePath)
    const archiveName = fs.readdirSync(extractedMavenPath)[0]
    const archivePath = path.join(extractedMavenPath, archiveName)
    const version = mavenVersion
    toolPath = await tc.cacheDir(archivePath, 'maven', version)
  }
  const macOSPostfixPath = path.join(toolPath, MACOS_JAVA_CONTENT_POSTFIX)
  if (process.platform === 'darwin' && fs.existsSync(macOSPostfixPath)) {
    toolPath = macOSPostfixPath
  }
  core.info(`Setting Maven ${mavenVersion} as default`)
  setMavenDefault(mavenVersion, toolPath)
  return {toolPath, version: mavenVersion}
}
export async function installDownloadedMaven(
  mavenUrl: string,
  mavenVersion: string
) {
  let toolPath = tc.find('maven', mavenVersion)
  if (toolPath) {
    core.info(`Resolved Maven ${mavenVersion} from tool-cache`)
  } else {
    core.info(
      `Maven ${mavenVersion} was not found in tool-cache, Trying to download from ${mavenUrl}`
    )
    if (!mavenUrl) {
      throw new Error('maven download url is not specified')
    }
    const mavenFilePath = await tc.downloadTool(mavenUrl)
    const stats = fs.statSync(mavenFilePath)
    if (!stats.isFile()) {
      throw new Error(`maven download url ${mavenUrl} is not a file`)
    }
    core.info(`Extracting Maven from  ${mavenFilePath}`)
    const extractedMavenPath = await extractMaven(
      mavenFilePath,
      getExtension(mavenUrl)
    )
    const archiveName = fs.readdirSync(extractedMavenPath)[0]
    const archivePath = path.join(extractedMavenPath, archiveName)
    const version = mavenVersion
    toolPath = await tc.cacheDir(archivePath, 'maven', version)
  }
  const macOSPostfixPath = path.join(toolPath, MACOS_JAVA_CONTENT_POSTFIX)
  if (process.platform === 'darwin' && fs.existsSync(macOSPostfixPath)) {
    toolPath = macOSPostfixPath
  }
  core.info(`Setting Maven ${mavenVersion} as default`)
  setMavenDefault(mavenVersion, toolPath)
  return {
    toolPath,
    version: mavenVersion
  }
}

export async function installMaven(mavenVersion: string) {
  let toolPath = tc.find('maven', mavenVersion)
  if (toolPath) {
    core.info(`Resolved Maven ${mavenVersion} from tool-cache`)
  } else {
    core.info(
      `Maven ${mavenVersion} was not found in tool-cache, Trying to download from ${getDownloadArchiveUrl(
        mavenVersion
      )}`
    )
    const mavenUrl = getDownloadArchiveUrl(mavenVersion)
    const mavenFilePath = await tc.downloadTool(mavenUrl)
    const stats = fs.statSync(mavenFilePath)
    if (!stats.isFile()) {
      throw new Error(`maven download url ${mavenUrl} is not a file`)
    }
    core.info(`Extracting Maven from  ${mavenFilePath}`)
    const extractedMavenPath = await extractMaven(
      mavenFilePath,
      getDownloadArchiveExtension()
    )
    const archiveName = fs.readdirSync(extractedMavenPath)[0]
    const archivePath = path.join(extractedMavenPath, archiveName)
    const version = mavenVersion
    toolPath = await tc.cacheDir(archivePath, 'maven', version)
  }
  const macOSPostfixPath = path.join(toolPath, MACOS_JAVA_CONTENT_POSTFIX)
  if (process.platform === 'darwin' && fs.existsSync(macOSPostfixPath)) {
    toolPath = macOSPostfixPath
  }
  core.info(`Setting Maven ${mavenVersion} as default`)
  setMavenDefault(mavenVersion, toolPath)
  return {
    toolPath,
    version: mavenVersion
  }
}

async function extractMaven(toolPath: string, extension?: string) {
  if (!extension) {
    extension = toolPath.endsWith('.tar.gz') ? 'tar.gz' : path.extname(toolPath)
    if (extension.startsWith('.')) {
      extension = extension.substring(1)
    }
  }
  switch (extension) {
    case 'tar.gz':
    case 'tar':
      return await tc.extractTar(toolPath)
    case 'zip':
      return await tc.extractZip(toolPath)
    default:
      return await tc.extract7z(toolPath)
  }
}
function getDownloadArchiveUrl(version: string) {
  let url = `https://archive.apache.org/dist/maven/maven-3/${version}/binaries/apache-maven-${version}-bin`
  let extension = getDownloadArchiveExtension()
  return `${url}.${extension}`
}
function getDownloadArchiveExtension() {
  return process.platform === 'win32' ? 'zip' : 'tar.gz'
}
function getExtension(url: string) {
  const extension = url.endsWith('.tar.gz') ? 'tar.gz' : path.extname(url)
  if (extension.startsWith('.')) {
    return extension.substring(1)
  }
  return extension
}
function setMavenDefault(version: string, toolPath: string) {
  // set maven env variable
  core.addPath(path.join(toolPath, 'bin'))
  core.exportVariable('MAVEN_HOME', toolPath)
  core.exportVariable('MAVEN_VERSION', version)
  core.info(`set MAVEN_HOME=${toolPath}`)
}
