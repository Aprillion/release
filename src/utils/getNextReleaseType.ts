import * as semver from 'semver'
import { ParsedCommitWithHash } from './git/parseCommits'

export function getNextReleaseType(
  commits: ParsedCommitWithHash[],
): semver.ReleaseType | null {
  const ranges: ['minor' | null, 'patch' | null] = [null, null]

  for (const commit of commits) {
    const hasBreakingChangeNote = commit.notes.some(
      (note) => note.title === 'BREAKING CHANGE',
    )

    if (hasBreakingChangeNote) {
      return 'major'
    }

    // Respect the parsed "type" from the "conventional-commits-parser".
    switch (commit.type) {
      case 'feat': {
        ranges[0] = 'minor'
        break
      }

      case 'fix': {
        ranges[1] = 'patch'
        break
      }
    }
  }

  /**
   * @fixme Commit messages can also append "!" to the scope
   * to indicate that the commit is a breaking change.
   * @see https://www.conventionalcommits.org/en/v1.0.0/#summary
   *
   * Unfortunately, "conventional-commits-parser" does not support that.
   */

  return ranges[0] || ranges[1]
}
