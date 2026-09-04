/**
 * Single source of truth for the JWT signing/verification secret.
 *
 * Previously the secret was read inline as `process.env.JWT_SECRET || 'secret'`
 * in some places and `|| 'your_jwt_secret_key'` in others. Two problems:
 *
 *   1. A hardcoded fallback means that if the environment variable is ever
 *      missing, tokens are signed and verified with a secret that is public in
 *      this source tree — anyone could forge a valid organizer token.
 *   2. The two fallbacks disagreed, so signing and verifying would silently use
 *      different keys and every login would break — proof the app already
 *      depends on JWT_SECRET being set.
 *
 * Requiring the variable removes the forgery risk and fails loudly instead of
 * insecurely when it is absent.
 */
export function getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;

    if (!secret || secret.trim() === '') {
        throw new Error(
            'JWT_SECRET is not configured. Set a strong, random JWT_SECRET in the environment before starting the API.'
        );
    }

    return secret;
}
