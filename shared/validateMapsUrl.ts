/**
 * Best-effort cleanup when a Maps URL was pasted with extra shell/Python on the same line
 * or following lines (first line only; strip ` > ...` and ` << ...`).
 */
export function sanitizeMapsUrlCliInput(raw: string): string {
  let s = raw.replace(/^\s+/, '').split(/\r?\n/, 1)[0] ?? ''
  s = (s.split(/\t/, 1)[0] ?? '').trim()
  const heredoc = s.indexOf('<<')
  if (heredoc !== -1) {
    s = s.slice(0, heredoc).trimEnd()
  }
  const gt = s.search(/\s>>?\s*/)
  if (gt !== -1) {
    s = s.slice(0, gt).trimEnd()
  }
  return s.trim()
}

/**
 * Reject CLI args that accidentally include shell/Python from a bad paste
 * (e.g. URL + `> file << 'EOF'` + test code).
 */
export function validateMapsUrlForCli(raw: string): { ok: true } | { ok: false; message: string } {
  const s = raw.trim()
  if (!s.startsWith('http')) {
    return { ok: false, message: 'URL must start with https://' }
  }
  if (/[\r\n\t]/.test(s)) {
    return {
      ok: false,
      message:
        'URL contains a newline or tab. You may have pasted extra lines (e.g. a heredoc or test file). Copy only the Google Maps link and wrap it in double quotes.',
    }
  }
  if (s.includes('<<')) {
    return {
      ok: false,
      message:
        'URL contains `<<` (shell heredoc). Paste only the Maps URL inside quotes — do not include `run_tests.py`, `EOF`, or Python code.',
    }
  }
  if (/\s>\s*\S/.test(s)) {
    return {
      ok: false,
      message:
        'URL contains a shell redirect (`>`). Paste only the Google Maps link, not `> run_tests.py` or other commands.',
    }
  }
  if (s.includes('#!/')) {
    return {
      ok: false,
      message:
        'URL contains a script shebang (`#!/`). That usually means a whole file was pasted; use only the https://...google...maps... link.',
    }
  }
  if (!/google|goo\.gl|maps\.app/i.test(s)) {
    return { ok: false, message: 'URL does not look like a Google Maps link.' }
  }
  return { ok: true }
}
