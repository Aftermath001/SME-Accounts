import axios from 'axios';
import Logger from '../utils/logger';

export interface MpesaConfig {
  consumerKey: string;
  consumerSecret: string;
  shortcode: string;
  passkey: string;
  callbackUrl: string;
  baseUrl: string; // https://sandbox.safaricom.co.ke or https://api.safaricom.co.ke
}

interface CachedToken {
  token: string;
  expiresAt: number; // epoch ms
}

export class MpesaTokenService {
  private cache: CachedToken | null = null;
  constructor(private readonly config: MpesaConfig) {}

  async getAccessToken(): Promise<string> {
    if (this.cache && Date.now() < this.cache.expiresAt - 60_000) {
      return this.cache.token;
    }

    const url = `${this.config.baseUrl}/oauth/v1/generate?grant_type=client_credentials`;
    const auth = Buffer.from(`${this.config.consumerKey}:${this.config.consumerSecret}`).toString('base64');

    try {
      const { data } = await axios.get(url, {
        headers: { Authorization: `Basic ${auth}` },
        timeout: 10_000,
      });

      const token = data.access_token as string;
      const expiresInSec = Number(data.expires_in ?? 3599);
      this.cache = {
        token,
        expiresAt: Date.now() + expiresInSec * 1000,
      };
      Logger.info('Obtained M-Pesa access token');
      return token;
    } catch (err) {
      Logger.error('Failed to obtain M-Pesa access token');
      throw err;
    }
  }
}

export function loadMpesaConfigFromEnv(): MpesaConfig {
  const baseUrl = process.env.MPESA_BASE_URL || 'https://sandbox.safaricom.co.ke';
  const consumerKey = process.env.MPESA_CONSUMER_KEY || '';
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET || '';
  const shortcode = process.env.MPESA_SHORTCODE || '';
  const passkey = process.env.MPESA_PASSKEY || '';
  const callbackUrl = process.env.MPESA_CALLBACK_URL || '';

  if (!consumerKey || !consumerSecret || !shortcode || !passkey || !callbackUrl) {
    throw new Error('Missing M-Pesa configuration in environment variables');
  }

  return { baseUrl, consumerKey, consumerSecret, shortcode, passkey, callbackUrl };
}
