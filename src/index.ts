import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Nonce } from './durable-objects/nonce';
import { generateNonce } from './nonce';
import { verifyMessage } from './siwf';
import { createJWT, verifyJWT } from './jwt';

export { Nonce };

const app = new Hono<{ Bindings: Cloudflare.Env }>();

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  maxAge: 86400,
}));

app.get('/.well-known/jwks.json', async (c) => {
  try {
    const publicKey = JSON.parse(c.env.JWK_PUBLIC_KEY);

    return c.json({
      keys: [publicKey]
    });
  } catch (error) {
    console.error('Error retrieving public key:', error);
    return c.json({ error: 'Failed to retrieve public key' }, 500);
  }
});

app.post('/nonce', async (c) => {
  try {
    const nonce = await generateNonce(c.env);
    return c.json({ nonce });
  } catch (error) {
    console.error('Error generating nonce:', error);
    return c.json({ error: 'Failed to generate nonce' }, 500);
  }
});

app.post('/verify-siwf', async (c) => {
  try {
    const { message, domain, signature } = await c.req.json<{ message: string; domain: string; signature: string; }>();

    if (!message) {
      return c.json({ error: 'Message is required' }, 400);
    }

    if (!signature) {
      return c.json({ error: 'Signature is required' }, 400);
    }

    if (!domain) {
      return c.json({ error: 'Domain is required' }, 400);
    }

    const verifyResult = await verifyMessage(c.env, { domain, message, signature });

    if (verifyResult.isValid) {
      const token = await createJWT({
        env: c.env,
        fid: verifyResult.fid,
        address: verifyResult.address,
        domain
      });

      return c.json({ valid: true, token });
    }

    return c.json({ valid: false });
  } catch (error) {
    console.error('Error verifying message');
    return c.json({ error: `Failed to verify message: ${error}` }, 500);
  }
});

app.post('/verify-token', async (c) => {
  try {
    const { token, domain } = await c.req.json<{ token: string; domain: string; }>();

    if (!token) {
      return c.json({ error: 'Token is required' }, 400);
    }

    if (!domain) {
      return c.json({ error: 'Domain is required' }, 400);
    }

    const payload = await verifyJWT({ env: c.env, token, domain });
    if (payload) {
      return c.json({ valid: true, payload });
    }

    return c.json({ valid: false });
  } catch (error) {
    console.error('Error verifying JWT:', error);
    return c.json({ error: 'Failed to verify JWT' }, 500);
  }
});

export default app;
