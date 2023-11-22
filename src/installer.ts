// Load tempDirectory before it gets wiped by tool-cache
let tempDirectory = process.env['RUNNER_TEMPDIRECTORY'] || ''

import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import path from 'path'
import fs from 'fs'

const MACOS_JAVA_CONTENT_POSTFIX = 'Contents/Home'

if (!tempDirectory) {
  let baseLocation: string
  if (process.platform === 'win32') {
    baseLocation = process.env['USERPROFILE'] || 'C:\\'
  } else {
    if (process.platform === 'darwin') {
      baseLocation = '/Users'
    } else {
      baseLocation = '/home'
    }
  }
  tempDirectory = path.join(baseLocation, 'actions', 'temp')
}

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
    core.info(`maven ${mavenVersion} already installed at ${toolPath}`)
  } else {
    core.info(`Maven ${mavenVersion} not found, extracting ${mavenFile}`)
    if (!mavenFile) {
      throw new Error('Please set maven_file')
    }
    const mavenFilePath = path.resolve(mavenFile)
    const stats = fs.statSync(mavenFilePath)
    if (!stats.isFile()) {
      throw new Error(`maven_file ${mavenFile} is not a file`)
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
  return toolPath
}
export async function installDownloadedMaven(
  mavenUrl: string,
  mavenVersion: string
) {
  let toolPath = tc.find('maven', mavenVersion)
  if (toolPath) {
    core.info(`maven ${mavenVersion} already installed at ${toolPath}`)
  } else {
    core.info(`Maven ${mavenVersion} not found, downloading from ${mavenUrl}`)
    if (!mavenUrl) {
      throw new Error('Please set url')
    }
    const mavenFilePath = await tc.downloadTool(mavenUrl)
    const stats = fs.statSync(mavenFilePath)
    if (!stats.isFile()) {
      throw new Error(`url ${mavenUrl} is not a file`)
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
  return toolPath
}

export async function installMaven(mavenVersion: string) {
  let toolPath = tc.find('maven', mavenVersion)
  if (toolPath) {
    core.info(`maven ${mavenVersion} already installed at ${toolPath}`)
  } else {
    core.info(
      `Maven ${mavenVersion} not found, installing from https://archive.apache.org/dist/maven/maven-3/${mavenVersion}/binaries/apache-maven-${mavenVersion}-bin.tar.gz`
    )
    const mavenUrl = `https://archive.apache.org/dist/maven/maven-3/${mavenVersion}/binaries/apache-maven-${mavenVersion}-bin.tar.gz`
    const mavenFilePath = await tc.downloadTool(mavenUrl)
    const stats = fs.statSync(mavenFilePath)
    if (!stats.isFile()) {
      throw new Error(`maven_url ${mavenUrl} is not a file`)
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
  return toolPath
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
function setMavenDefault(version: string, toolPath: string) {
  // set maven env variable
  core.addPath(path.join(toolPath, 'bin'))
  core.exportVariable('MAVEN_HOME', toolPath)
  core.exportVariable('MAVEN_VERSION', version)
  core.info(`set MAVEN_HOME=${toolPath}`)
}
