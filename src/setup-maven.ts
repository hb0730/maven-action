import * as core from '@actions/core'
import {
  installMaven,
  installDownloadedMaven,
  installExtractedMaven
} from './installer'

export async function setupMaven(): Promise<void> {
  try {
    const mavenVersion = core.getInput('maven-version')
    if (mavenVersion.length == 0) {
      core.setFailed('Please set maven-version')
    }
    const mavenFile = core.getInput('maven-file')
    const mavenUrl = core.getInput('url')
    let outputs = {
      version: '',
      toolPath: ''
    }
    if (mavenFile) {
      outputs = await installExtractedMaven(mavenFile, mavenVersion)
    } else if (mavenUrl) {
      outputs = await installDownloadedMaven(mavenUrl, mavenVersion)
    } else if (mavenVersion) {
      outputs = await installMaven(mavenVersion)
    } else {
      core.setFailed('Please set maven-file or url or maven-version')
    }
    core.info('')
    core.info('Setup maven complete')
    core.info(`version: ${outputs.version}`)
    core.info(`path: ${outputs.toolPath}`)
    core.info("You can run 'mvn -v' to check maven version")
    core.setOutput('version', outputs.version)
    core.setOutput('path', outputs.toolPath)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}
