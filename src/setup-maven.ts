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
    if (mavenFile) {
      installExtractedMaven(mavenFile, mavenVersion)
    } else if (mavenUrl) {
      installDownloadedMaven(mavenUrl, mavenVersion)
    } else if (mavenVersion) {
      installMaven(mavenVersion)
    } else {
      core.setFailed('Please set maven-file or url or maven-version')
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}
