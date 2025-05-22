import { DurableObject } from "cloudflare:workers";

export class NoncePool extends DurableObject<Cloudflare.Env> {
  sql: SqlStorage;

  constructor(ctx: DurableObjectState, env: Cloudflare.Env) {
    super(ctx, env)
    this.sql = ctx.storage.sql;

    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS nonces(
        nonce      TEXT PRIMARY KEY,
        expires_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_nonces_expires_at ON nonces(expires_at);
    `)
  }

  async store(nonce: string): Promise<boolean> {
    const expiresAt = Date.now() + 5 * 60 * 1000;

    this.sql.exec(`INSERT INTO nonces (nonce, expires_at) VALUES (?, ?);`, nonce, expiresAt);
    this.scheduleCleanup();

    return true;
  }

  // Consume the nonce if it's valid
  async consume(nonce: string): Promise<boolean> {
    const cursor = this.sql.exec<{ expires_at: number }>(`DELETE FROM nonces 
      WHERE nonce = ?
      RETURNING expires_at;
    `, nonce)

    const row = cursor.next();
    if (!row.value || row.value.expires_at < Date.now()) {
      return false;
    }

    return true;
  }

  async alarm() {
    await this.cleanup();
  }

  private async scheduleCleanup(): Promise<void> {
    let currentAlarm = await this.ctx.storage.getAlarm();
    if (currentAlarm == null) {
      this.ctx.storage.setAlarm(Date.now() + 5 * 60 * 1000);
    }
  }

  private async cleanup(): Promise<void> {
    this.sql.exec(`DELETE FROM nonces WHERE expires_at <= ?`, Date.now())
  }
}
