let capacity = 4;
let order = [];   // least recently used at index 0, most recently used at the end
let store = {};   // key -> value
let lastTouched = null;

const cacheRow = document.getElementById('cacheRow');
const logEl = document.getElementById('log');
const errEl = document.getElementById('err');
const capInput = document.getElementById('cap');
const keyInput = document.getElementById('keyIn');
const valInput = document.getElementById('valIn');

function setError(msg) {
  errEl.textContent = msg || '';
}

function log(msg, kind) {
  const line = document.createElement('div');
  line.className = kind || 'info';
  line.textContent = msg;
  logEl.prepend(line);
}

function touch(key) {
  const idx = order.indexOf(key);
  if (idx > -1) order.splice(idx, 1);
  order.push(key);
}

function render() {
  cacheRow.innerHTML = '';

  if (order.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'Cache is empty';
    cacheRow.appendChild(empty);
    return;
  }

  // Render most recently used first (rightmost), least recently used last (leftmost)
  for (let i = order.length - 1; i >= 0; i--) {
    const key = order[i];
    const isMRU = i === order.length - 1;
    const isLRU = i === 0;
    const isTouched = key === lastTouched;

    const card = document.createElement('div');
    card.className = 'card' + (isTouched ? ' touched' : '');

    const kv = document.createElement('div');
    kv.className = 'kv';
    kv.textContent = key + ' = ' + store[key];

    const tag = document.createElement('div');
    tag.className = 'tag';
    tag.textContent = isMRU ? 'MRU' : isLRU ? 'LRU (next evict)' : '';

    card.appendChild(kv);
    card.appendChild(tag);
    cacheRow.appendChild(card);
  }
}

function put() {
  const key = keyInput.value.trim();
  const val = valInput.value.trim();

  if (!key || !val) {
    setError('Enter both a key and a value first');
    return;
  }
  setError('');

  if (store.hasOwnProperty(key)) {
    store[key] = val;
    touch(key);
    log('put(' + key + ', ' + val + ') -> updated existing key', 'hit');
  } else {
    if (order.length >= capacity) {
      const evicted = order.shift();
      delete store[evicted];
      log('evicted "' + evicted + '" to make room', 'evict');
    }
    store[key] = val;
    order.push(key);
    log('put(' + key + ', ' + val + ') -> inserted', 'info');
  }

  lastTouched = key;
  render();
}

function get() {
  const key = keyInput.value.trim();

  if (!key) {
    setError('Enter a key first');
    return;
  }
  setError('');

  if (store.hasOwnProperty(key)) {
    touch(key);
    lastTouched = key;
    log('get(' + key + ') -> ' + store[key] + ', moved to MRU', 'hit');
  } else {
    lastTouched = null;
    log('get(' + key + ') -> miss', 'evict');
  }

  render();
}

function reset() {
  const c = parseInt(capInput.value, 10);
  capacity = (c && c > 0) ? Math.min(c, 8) : 4;
  capInput.value = capacity;

  order = [];
  store = {};
  lastTouched = null;
  setError('');
  logEl.innerHTML = '';
  log('cache reset with capacity ' + capacity, 'info');
  render();
}

document.getElementById('putBtn').addEventListener('click', put);
document.getElementById('getBtn').addEventListener('click', get);
document.getElementById('resetBtn').addEventListener('click', reset);

capInput.addEventListener('change', () => {
  const c = parseInt(capInput.value, 10);
  if (c && c > 0) capacity = Math.min(c, 8);
});

// initial state
log('cache reset with capacity 4', 'info');
render();
