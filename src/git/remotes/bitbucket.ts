'use strict';
import { Range } from 'vscode';
import { RemoteProvider } from './provider';

const issueEnricherRegex = /(^|\s)(issue #([0-9]+))\b/gi;
const prEnricherRegex = /(^|\s)(pull request #([0-9]+))\b/gi;

export class BitbucketRemote extends RemoteProvider {
    constructor(domain: string, path: string, protocol?: string, name?: string, custom: boolean = false) {
        super(domain, path, protocol, name, custom);
    }

    get icon() {
        return 'bitbucket';
    }

    get name() {
        return this.formatName('Bitbucket');
    }

    enrichMessage(message: string): string {
        return (
            message
                // Matches issue #123
                .replace(issueEnricherRegex, `$1[$2](${this.baseUrl}/issues/$3 "Open Issue $2")`)
                // Matches pull request #123
                .replace(prEnricherRegex, `$1[$2](${this.baseUrl}/pull-requests/$3 "Open PR $2")`)
        );
    }

    protected getUrlForBranches(): string {
        return `${this.baseUrl}/branches`;
    }

    protected getUrlForBranch(branch: string): string {
        return `${this.baseUrl}/commits/branch/${branch}`;
    }

    protected getUrlForCommit(sha: string): string {
        return `${this.baseUrl}/commits/${sha}`;
    }

    protected getUrlForFile(fileName: string, branch?: string, sha?: string, range?: Range): string {
        let line;
        if (range) {
            if (range.start.line === range.end.line) {
                line = `#${fileName}-${range.start.line}`;
            }
            else {
                line = `#${fileName}-${range.start.line}:${range.end.line}`;
            }
        }
        else {
            line = '';
        }

        if (sha) return `${this.baseUrl}/src/${sha}/${fileName}${line}`;
        if (branch) return `${this.baseUrl}/src/${branch}/${fileName}${line}`;
        return `${this.baseUrl}?path=${fileName}${line}`;
    }
}
