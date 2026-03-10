/**
 * Shared utility for live-environment detection driven by hostname.
 * Keeps behavior consistent across Publish Live UI and Verify smoke test.
 * 
 * Live URLs follow the pattern: {slug}.caffeine.xyz (where slug is 5-50 chars)
 * Draft/preview URLs follow patterns like: draft-{id}.caffeine.xyz, preview-{id}.caffeine.xyz, etc.
 */

/**
 * Detects if the current environment is Live based on hostname.
 * Live environment is identified by hostname matching the pattern {slug}.caffeine.xyz
 * where slug does NOT start with known draft/preview prefixes.
 */
export function isLiveEnvironment(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  const hostname = window.location.hostname;
  
  // Must end with .caffeine.xyz
  if (!hostname.endsWith('.caffeine.xyz')) {
    return false;
  }
  
  // Extract the subdomain (everything before .caffeine.xyz)
  const subdomain = hostname.replace('.caffeine.xyz', '');
  
  // Draft/preview patterns to exclude (these are NOT Live)
  const draftPatterns = [
    /^draft-/i,      // draft-xyz.caffeine.xyz
    /^preview-/i,    // preview-xyz.caffeine.xyz
    /^staging-/i,    // staging-xyz.caffeine.xyz
    /^test-/i,       // test-xyz.caffeine.xyz
    /^dev-/i,        // dev-xyz.caffeine.xyz
  ];
  
  // If subdomain matches any draft pattern, it's NOT Live
  if (draftPatterns.some(pattern => pattern.test(subdomain))) {
    return false;
  }
  
  // If subdomain is valid length (5-50 chars) and doesn't match draft patterns, it's Live
  // Note: We don't enforce the full slug validation here (letters/numbers/hyphens only)
  // because the hostname has already been resolved, so we trust it's valid
  return subdomain.length >= 5 && subdomain.length <= 50;
}

/**
 * Detects if the current environment is Draft/preview based on hostname.
 */
export function isDraftEnvironment(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  const hostname = window.location.hostname;
  
  // Must end with .caffeine.xyz
  if (!hostname.endsWith('.caffeine.xyz')) {
    return false;
  }
  
  const subdomain = hostname.replace('.caffeine.xyz', '');
  
  // Draft/preview patterns
  const draftPatterns = [
    /^draft-/i,
    /^preview-/i,
    /^staging-/i,
    /^test-/i,
    /^dev-/i,
  ];
  
  return draftPatterns.some(pattern => pattern.test(subdomain));
}

/**
 * Gets the current hostname safely (returns 'unknown' if window is not available)
 */
export function getCurrentHostname(): string {
  if (typeof window === 'undefined') {
    return 'unknown';
  }
  return window.location.hostname;
}

/**
 * Gets a human-readable environment label
 */
export function getEnvironmentLabel(): string {
  if (isLiveEnvironment()) {
    return 'Live';
  }
  if (isDraftEnvironment()) {
    return 'Draft';
  }
  return 'Development';
}
