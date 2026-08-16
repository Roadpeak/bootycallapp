// lib/utils/display-name.ts

/**
 * Shape of any API object that can carry a name.
 * Covers User, Escort, DatingProfile and chat participants.
 */
interface NameSource {
    displayName?: string | null
    firstName?: string | null
    name?: string | null
}

/**
 * Resolves the name shown publicly for a user.
 *
 * Users pick a display name at signup precisely so their legal name is never
 * exposed on the site. `lastName` is deliberately not consulted here — falling
 * back to `firstName lastName` would defeat that, so an account with no display
 * name degrades to the first name alone and then to a neutral placeholder.
 *
 * @param source  the profile, escort or participant object
 * @param nested  optional nested `user` object to check when the outer object
 *                carries no name of its own (escorts and dating profiles hold
 *                their names on an included `user` relation)
 */
export function getPublicDisplayName(
    source: NameSource | null | undefined,
    nested?: NameSource | null,
): string {
    const candidates = [
        source?.displayName,
        source?.name,
        source?.firstName,
        nested?.displayName,
        nested?.firstName,
    ]

    for (const candidate of candidates) {
        const trimmed = candidate?.trim()
        if (trimmed) return trimmed
    }

    return 'Anonymous'
}

/**
 * Fields a public name search is allowed to match against.
 * Mirrors getPublicDisplayName so search can never surface someone by a
 * surname that is not rendered anywhere in the UI.
 */
export function getSearchableName(
    source: NameSource | null | undefined,
    nested?: NameSource | null,
): string {
    return [
        source?.displayName,
        source?.name,
        source?.firstName,
        nested?.displayName,
        nested?.firstName,
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
}
