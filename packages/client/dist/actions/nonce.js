export async function generateNonce({ origin }) {
    const response = await fetch(`${origin}/nonce`, {
        method: 'POST',
    });
    if (!response.ok) {
        throw new Error(`Request failed (status ${response.status})`);
    }
    return await response.json();
}
