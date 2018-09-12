import test from 'ava';

import runProcess from '../run-process';

test('run-process should fail with fun', async (t) => {
    const err = await t.throwsAsync(runProcess('npm', ['run', 'notask'], {}, {}));
    t.truthy(err);
});
