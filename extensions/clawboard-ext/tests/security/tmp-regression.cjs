'use strict';

// Run after npm ci: node tests/security/tmp-regression.cjs
// TMP_PACKAGE_PATH is only for comparing the exact official baseline fixture.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const tmp = require(process.env.TMP_PACKAGE_PATH || 'tmp');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'clawboard-tmp-regression-'));
const base = path.join(root, 'safe');
fs.mkdirSync(base);
fs.mkdirSync(path.join(root, 'safe-sibling'));
let passed = 0;
const failures = [];
function check(name, fn) {
  try { fn(); passed++; } catch (error) { failures.push({ name, message: error.message }); }
}
try {
  check('normal file, bytes, descriptor and cleanup', () => {
    const item = tmp.fileSync({ tmpdir: base, prefix: 'tmp-web-ext-', postfix: '.txt' });
    assert.equal(path.dirname(item.name), base);
    fs.writeSync(item.fd, 'synthetic fixture');
    assert.equal(fs.readFileSync(item.name, 'utf8'), 'synthetic fixture');
    item.removeCallback();
    assert.equal(fs.existsSync(item.name), false);
  });
  check('normal nonempty directory cleanup', () => {
    const item = tmp.dirSync({ tmpdir: base, prefix: 'tmp-web-ext-', unsafeCleanup: true });
    fs.writeFileSync(path.join(item.name, 'fixture.txt'), 'synthetic');
    item.removeCallback();
    assert.equal(fs.existsSync(item.name), false);
  });
  check('valid template remains inside base', () => {
    const name = tmp.tmpNameSync({ tmpdir: base, template: 'valid-XXXXXX' });
    assert.equal(path.dirname(name), base);
  });
  for (const [name, options] of [
    ['prefix traversal', { prefix: '../escape' }],
    ['postfix traversal', { postfix: '/../escape' }],
    ['template traversal', { template: '../escape-XXXXXX' }],
    ['same-prefix sibling directory escape', { dir: '../safe-sibling' }],
    ['relative directory escape', { dir: '../other' }],
    ['explicit filename path', { name: '../escape' }],
  ]) {
    check('reject ' + name + ' without creating files', () => {
      const before = fs.readdirSync(root).sort();
      assert.throws(() => tmp.tmpNameSync({ tmpdir: base, ...options }));
      assert.deepEqual(fs.readdirSync(root).sort(), before);
    });
  }
  console.log(JSON.stringify({ passed, failed: failures.length, failures }));
  process.exitCode = failures.length ? 1 : 0;
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
