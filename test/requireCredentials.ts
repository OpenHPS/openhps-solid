/**
 * Every suite in this package is an integration test against a live Solid Pod, driven
 * by the `clientId`, `clientSecret` and `podUrl` values in a local `.env`. There are no
 * such credentials in CI, and without them the suites failed with
 * `Client ID and Client Secret must be set` rather than reporting themselves as
 * unrunnable.
 *
 * Call this at the top of a suite's `before` hook. It returns `true` when credentials
 * are present, and skips the surrounding suite when they are not.
 * @param {Mocha.Context} ctx the mocha context of the enclosing hook
 * @returns {boolean} whether credentials are available
 */
export function requireCredentials(ctx: Mocha.Context): boolean {
    if (process.env.clientId && process.env.clientSecret) {
        return true;
    }
    ctx.skip();
    return false;
}
