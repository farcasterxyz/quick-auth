export async function verifySiwf({ origin }, options) {
    const response = await fetch(`${origin}/verify-siwf`, {
        method: 'POST',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(options)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get nonce');
    }
    const data = await response.json();
    if (data.valid === false) {
        throw new Error("Invalid: " + (data.message ?? 'unknown'));
    }
    return { token: data.token };
}
