"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.installMaven = exports.installDownloadedMaven = exports.installExtractedMaven = void 0;
// Load tempDirectory before it gets wiped by tool-cache
let tempDirectory = process.env['RUNNER_TEMPDIRECTORY'] || '';
const core = __importStar(require("@actions/core"));
const tc = __importStar(require("@actions/tool-cache"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const MACOS_JAVA_CONTENT_POSTFIX = 'Contents/Home';
if (!tempDirectory) {
    let baseLocation;
    if (process.platform === 'win32') {
        baseLocation = process.env['USERPROFILE'] || 'C:\\';
    }
    else {
        if (process.platform === 'darwin') {
            baseLocation = '/Users';
        }
        else {
            baseLocation = '/home';
        }
    }
    tempDirectory = path_1.default.join(baseLocation, 'actions', 'temp');
}
async function installExtractedMaven(mavenFile, mavenVersion) {
    let toolPath = tc.find('maven', mavenVersion);
    if (toolPath) {
        core.info(`maven ${mavenVersion} already installed at ${toolPath}`);
    }
    else {
        core.info(`Maven ${mavenVersion} not found, extracting ${mavenFile}`);
        if (!mavenFile) {
            throw new Error('Please set maven_file');
        }
        const mavenFilePath = path_1.default.resolve(mavenFile);
        const stats = fs_1.default.statSync(mavenFilePath);
        if (!stats.isFile()) {
            throw new Error(`maven_file ${mavenFile} is not a file`);
        }
        core.info(`Extracting Maven from  ${mavenFilePath}`);
        const extractedMavenPath = await extractMaven(mavenFilePath);
        const archiveName = fs_1.default.readdirSync(extractedMavenPath)[0];
        const archivePath = path_1.default.join(extractedMavenPath, archiveName);
        const version = mavenVersion;
        toolPath = await tc.cacheDir(archivePath, 'maven', version);
    }
    const macOSPostfixPath = path_1.default.join(toolPath, MACOS_JAVA_CONTENT_POSTFIX);
    if (process.platform === 'darwin' && fs_1.default.existsSync(macOSPostfixPath)) {
        toolPath = macOSPostfixPath;
    }
    core.info(`Setting Maven ${mavenVersion} as default`);
    setMavenDefault(mavenVersion, toolPath);
    return toolPath;
}
exports.installExtractedMaven = installExtractedMaven;
async function installDownloadedMaven(mavenUrl, mavenVersion) {
    let toolPath = tc.find('maven', mavenVersion);
    if (toolPath) {
        core.info(`maven ${mavenVersion} already installed at ${toolPath}`);
    }
    else {
        core.info(`Maven ${mavenVersion} not found, downloading from ${mavenUrl}`);
        if (!mavenUrl) {
            throw new Error('Please set url');
        }
        const mavenFilePath = await tc.downloadTool(mavenUrl);
        const stats = fs_1.default.statSync(mavenFilePath);
        if (!stats.isFile()) {
            throw new Error(`url ${mavenUrl} is not a file`);
        }
        core.info(`Extracting Maven from  ${mavenFilePath}`);
        const extractedMavenPath = await extractMaven(mavenFilePath);
        const archiveName = fs_1.default.readdirSync(extractedMavenPath)[0];
        const archivePath = path_1.default.join(extractedMavenPath, archiveName);
        const version = mavenVersion;
        toolPath = await tc.cacheDir(archivePath, 'maven', version);
    }
    const macOSPostfixPath = path_1.default.join(toolPath, MACOS_JAVA_CONTENT_POSTFIX);
    if (process.platform === 'darwin' && fs_1.default.existsSync(macOSPostfixPath)) {
        toolPath = macOSPostfixPath;
    }
    core.info(`Setting Maven ${mavenVersion} as default`);
    setMavenDefault(mavenVersion, toolPath);
    return toolPath;
}
exports.installDownloadedMaven = installDownloadedMaven;
async function installMaven(mavenVersion) {
    let toolPath = tc.find('maven', mavenVersion);
    if (toolPath) {
        core.info(`maven ${mavenVersion} already installed at ${toolPath}`);
    }
    else {
        core.info(`Maven ${mavenVersion} not found, installing from https://archive.apache.org/dist/maven/maven-3/${mavenVersion}/binaries/apache-maven-${mavenVersion}-bin.tar.gz`);
        const mavenUrl = `https://archive.apache.org/dist/maven/maven-3/${mavenVersion}/binaries/apache-maven-${mavenVersion}-bin.tar.gz`;
        const mavenFilePath = await tc.downloadTool(mavenUrl);
        const stats = fs_1.default.statSync(mavenFilePath);
        if (!stats.isFile()) {
            throw new Error(`maven_url ${mavenUrl} is not a file`);
        }
        core.info(`Extracting Maven from  ${mavenFilePath}`);
        const extractedMavenPath = await extractMaven(mavenFilePath);
        const archiveName = fs_1.default.readdirSync(extractedMavenPath)[0];
        const archivePath = path_1.default.join(extractedMavenPath, archiveName);
        const version = mavenVersion;
        toolPath = await tc.cacheDir(archivePath, 'maven', version);
    }
    const macOSPostfixPath = path_1.default.join(toolPath, MACOS_JAVA_CONTENT_POSTFIX);
    if (process.platform === 'darwin' && fs_1.default.existsSync(macOSPostfixPath)) {
        toolPath = macOSPostfixPath;
    }
    core.info(`Setting Maven ${mavenVersion} as default`);
    setMavenDefault(mavenVersion, toolPath);
    return toolPath;
}
exports.installMaven = installMaven;
async function extractMaven(toolPath, extension) {
    if (!extension) {
        extension = toolPath.endsWith('.tar.gz') ? 'tar.gz' : path_1.default.extname(toolPath);
        if (extension.startsWith('.')) {
            extension = extension.substring(1);
        }
    }
    switch (extension) {
        case 'tar.gz':
        case 'tar':
            return await tc.extractTar(toolPath);
        case 'zip':
            return await tc.extractZip(toolPath);
        default:
            return await tc.extract7z(toolPath);
    }
}
function setMavenDefault(version, toolPath) {
    // set maven env variable
    core.addPath(path_1.default.join(toolPath, 'bin'));
    core.exportVariable('MAVEN_HOME', toolPath);
    core.exportVariable('MAVEN_VERSION', version);
    core.info(`set MAVEN_HOME=${toolPath}`);
}
//# sourceMappingURL=installer.js.map