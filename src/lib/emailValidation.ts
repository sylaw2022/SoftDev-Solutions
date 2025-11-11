import * as dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);
const resolve4 = promisify(dns.resolve4);
const resolve6 = promisify(dns.resolve6);

interface ValidationResult {
  isValid: boolean;
  error?: string;
  details: {
    domain?: string;
    mxRecords?: string[];
    hasRecords: boolean;
  };
}

export class EmailValidator {
  /**
   * Validates email address format
   */
  static validateFormat(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Extracts domain from email address
   */
  static extractDomain(email: string): string {
    const parts = email.split('@');
    return parts.length === 2 ? parts[1].toLowerCase() : '';
  }

  /**
   * Checks if the email domain has valid MX or A/AAAA records
   */
  static async validateDomain(domain: string): Promise<ValidationResult> {
    try {
      console.log('[EmailValidator] Validating domain:', domain);
      
      // Try to resolve MX records
      let mxRecords: string[] = [];
      try {
        const mxResult = await resolveMx(domain);
        mxRecords = mxResult.map(record => record.exchange);
        console.log('[EmailValidator] MX records found:', mxRecords);
      } catch {
        console.log('[EmailValidator] No MX records found, trying A/AAAA records');
      }

      // If no MX records, try A or AAAA records
      if (mxRecords.length === 0) {
        try {
          const aRecords = await resolve4(domain);
          console.log('[EmailValidator] A records found:', aRecords);
          
          if (aRecords.length > 0) {
            return {
              isValid: true,
              details: {
                domain,
                mxRecords: [],
                hasRecords: true
              }
            };
          }
        } catch {
          // Try AAAA
          try {
            const aaaaRecords = await resolve6(domain);
            console.log('[EmailValidator] AAAA records found:', aaaaRecords);
            
            if (aaaaRecords.length > 0) {
              return {
                isValid: true,
                details: {
                  domain,
                  mxRecords: [],
                  hasRecords: true
                }
              };
            }
          } catch {
            // No records found
          }
        }
      }

      if (mxRecords.length > 0) {
        return {
          isValid: true,
          details: {
            domain,
            mxRecords,
            hasRecords: true
          }
        };
      }

      return {
        isValid: false,
        error: 'Domain does not have valid MX or A records',
        details: {
          domain,
          hasRecords: false
        }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown DNS error';
      console.error('[EmailValidator] DNS validation failed:', errorMessage);
      
      return {
        isValid: false,
        error: `DNS lookup failed: ${errorMessage}`,
        details: {
          domain,
          hasRecords: false
        }
      };
    }
  }

  /**
   * Full email validation including format and domain check
   */
  static async validate(email: string): Promise<ValidationResult> {
    // Check format first
    if (!this.validateFormat(email)) {
      return {
        isValid: false,
        error: 'Invalid email format',
        details: {}
      };
    }

    // Extract and validate domain
    const domain = this.extractDomain(email);
    if (!domain) {
      return {
        isValid: false,
        error: 'Could not extract domain from email',
        details: {}
      };
    }

    // Check DNS records
    return await this.validateDomain(domain);
  }
}




