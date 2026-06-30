var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// node_modules/unenv/dist/runtime/_internal/utils.mjs
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
__name(PerformanceEntry, "PerformanceEntry");
var PerformanceMark = /* @__PURE__ */ __name(class PerformanceMark2 extends PerformanceEntry {
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
}, "PerformanceMark");
var PerformanceMeasure = class extends PerformanceEntry {
  entryType = "measure";
};
__name(PerformanceMeasure, "PerformanceMeasure");
var PerformanceResourceTiming = class extends PerformanceEntry {
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
__name(PerformanceResourceTiming, "PerformanceResourceTiming");
var PerformanceObserverEntryList = class {
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
__name(PerformanceObserverEntryList, "PerformanceObserverEntryList");
var Performance = class {
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
__name(Performance, "Performance");
var PerformanceObserver = class {
  __unenv__ = true;
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
__name(PerformanceObserver, "PerformanceObserver");
__publicField(PerformanceObserver, "supportedEntryTypes", []);
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
import { Socket } from "node:net";
var ReadStream = class extends Socket {
  fd;
  constructor(fd) {
    super();
    this.fd = fd;
  }
  isRaw = false;
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
  isTTY = false;
};
__name(ReadStream, "ReadStream");

// node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
import { Socket as Socket2 } from "node:net";
var WriteStream = class extends Socket2 {
  fd;
  constructor(fd) {
    super();
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  columns = 80;
  rows = 24;
  isTTY = false;
};
__name(WriteStream, "WriteStream");

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class extends EventEmitter {
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return "";
  }
  get versions() {
    return {};
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  ref() {
  }
  unref() {
  }
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: () => 0 });
  mainModule = void 0;
  domain = void 0;
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};
__name(Process, "Process");

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var { exit, platform, nextTick } = getBuiltinModule(
  "node:process"
);
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  nextTick
});
var {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  finalization,
  features,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  on,
  off,
  once,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// src/index.js
var src_default = {
  async fetch(request, env2, ctx) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Project-Id, X-Encrypted-Yw-ID, X-Is-Login, X-Yw-Env"
    };
    if (request.method === "OPTIONS") {
      const reqHeaders = request.headers.get("Access-Control-Request-Headers");
      const preflightHeaders = { ...corsHeaders };
      if (reqHeaders) {
        preflightHeaders["Access-Control-Allow-Headers"] = reqHeaders;
      } else {
        preflightHeaders["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Project-Id, X-Encrypted-Yw-ID, X-Is-Login, X-Yw-Env, Accept, X-Requested-With";
      }
      preflightHeaders["Access-Control-Max-Age"] = "86400";
      return new Response(null, { headers: preflightHeaders });
    }
    try {
      const url = new URL(request.url);
      const path = url.pathname;
      const method = request.method;
      const userId = request.headers.get("X-Encrypted-Yw-ID");
      const isLogin = request.headers.get("X-Is-Login") === "1";
      if (path === "/api/user/info" && method === "GET") {
        return await getUserInfo(env2.DB, userId, corsHeaders);
      }
      if (path === "/api/user/stats" && method === "GET") {
        return await getUserStats(env2.DB, userId, corsHeaders);
      }
      if (path === "/api/tasks" && method === "GET") {
        return await getTasks(env2.DB, corsHeaders);
      }
      if (path === "/api/tasks/complete" && method === "POST") {
        const body = await request.json();
        return await completeTask(env2.DB, userId, body, corsHeaders);
      }
      if (path === "/api/tasks" && method === "POST") {
        const body = await request.json();
        return await createTask3(env2.DB, userId, body, corsHeaders);
      }
      if (path === "/api/ranking" && method === "GET") {
        return await getRanking(env2.DB, corsHeaders);
      }
      if (path === "/api/meta-tasks" && method === "GET") {
        const userId2 = url.searchParams.get("user_id");
        return await getMetaTasks(env2.DB, corsHeaders, userId2);
      }
      if (path === "/api/meta-tasks" && method === "POST") {
        const body = await request.json();
        return await createMetaTasks(env2.DB, body, corsHeaders);
      }
      if (path === "/api/ind-tasks" && method === "GET") {
        const userId2 = url.searchParams.get("user_id");
        return await getIndTasks(env2.DB, corsHeaders, userId2);
      }
      if (path === "/api/ind-tasks" && method === "POST") {
        const body = await request.json();
        return await createIndTasks(env2.DB, body, corsHeaders);
      }
      if (path === "/api/user/photo" && method === "POST") {
        const body = await request.json();
        return await updateUserPhoto(env2.DB, userId, body, corsHeaders);
      }
      if (path === "/api/monthly-points" && method === "GET") {
        const month = url.searchParams.get("month");
        const year = url.searchParams.get("year");
        return await getMonthlyPoints(env2.DB, userId, month, year, corsHeaders);
      }
      if (path === "/api/monthly-reset" && method === "POST") {
        return await performMonthlyReset(env2.DB, corsHeaders);
      }
      if (path === "/api/user/list" && method === "GET") {
        return await getUserList(env2.DB, corsHeaders);
      }
      if (path === "/api/distribution-history" && method === "GET") {
        return await getDistributionHistory(env2.DB, corsHeaders);
      }
      if (path === "/api/user/update-points" && method === "POST") {
        const body = await request.json();
        return await updateUserPoints(env2.DB, userId, body, corsHeaders);
      }
      if (path === "/api/user/update-name" && method === "POST") {
        const body = await request.json();
        return await updateUserName(env2.DB, userId, body, corsHeaders);
      }
      return new Response(JSON.stringify({
        message: "FLOWER COINS API v1.0",
        endpoints: [
          "GET /api/user/info",
          "GET /api/user/stats",
          "GET /api/tasks",
          "POST /api/tasks/complete",
          "POST /api/admin/tasks",
          "GET /api/ranking",
          "POST /api/user/photo",
          "GET /api/monthly-points",
          "POST /api/monthly-reset",
          "GET /api/user/list",
          "GET /api/distribution-history",
          "POST /api/user/update-points",
          "POST /api/user/update-name"
        ]
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } catch (error3) {
      console.error("API Error:", error3);
      return new Response(JSON.stringify({
        error: "Internal server error",
        message: error3.message
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
};
async function getUserInfo(db, userId, corsHeaders) {
  if (!userId) {
    return new Response(JSON.stringify({ error: "User not authenticated" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  try {
    const { results } = await db.prepare("SELECT * FROM users WHERE encrypted_yw_id = ?").bind(userId).all();
    let user = results[0];
    if (!user) {
      await db.prepare(`
        INSERT INTO users (encrypted_yw_id, display_name, created_at) 
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `).bind(userId, `User_${userId.slice(-8)}`).run();
      const { results: newResults } = await db.prepare("SELECT * FROM users WHERE encrypted_yw_id = ?").bind(userId).all();
      user = newResults[0];
    }
    return new Response(JSON.stringify({
      success: true,
      user
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error3) {
    console.error("Get user info error:", error3);
    return new Response(JSON.stringify({ error: "Failed to get user info" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
__name(getUserInfo, "getUserInfo");
async function getUserStats(db, userId, corsHeaders) {
  if (!userId) {
    return new Response(JSON.stringify({ error: "User not authenticated" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  try {
    let { results } = await db.prepare("SELECT * FROM users WHERE encrypted_yw_id = ?").bind(userId).all();
    if (results.length === 0) {
      await db.prepare(`
        INSERT INTO users (encrypted_yw_id, flower_coins, flower_meta, level) 
        VALUES (?, 0, 0, 1)
      `).bind(userId).run();
      const { results: newResults } = await db.prepare("SELECT * FROM users WHERE encrypted_yw_id = ?").bind(userId).all();
      results = newResults;
    }
    return new Response(JSON.stringify({
      success: true,
      stats: results[0]
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error3) {
    console.error("Get user stats error:", error3);
    return new Response(JSON.stringify({ error: "Failed to get user stats" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
__name(getUserStats, "getUserStats");
async function getTasks(db, corsHeaders) {
  try {
    const { results } = await db.prepare("SELECT * FROM tasks WHERE is_active = 1 ORDER BY created_at DESC").all();
    return new Response(JSON.stringify({
      success: true,
      tasks: results
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error3) {
    console.error("Get tasks error:", error3);
    return new Response(JSON.stringify({ error: "Failed to get tasks" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
__name(getTasks, "getTasks");
async function completeTask(db, userId, body, corsHeaders) {
  if (!userId) {
    return new Response(JSON.stringify({ error: "User not authenticated" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  const { taskId } = body;
  if (!taskId) {
    return new Response(JSON.stringify({ error: "Task ID required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  try {
    const { results: taskResults } = await db.prepare("SELECT * FROM tasks WHERE id = ? AND is_active = 1").bind(taskId).all();
    if (taskResults.length === 0) {
      return new Response(JSON.stringify({ error: "Task not found or inactive" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const task = taskResults[0];
    const updateStmt = db.prepare(`
      INSERT OR REPLACE INTO users (encrypted_yw_id, flower_coins, flower_meta, level, updated_at)
      VALUES (
        ?, 
        COALESCE((SELECT flower_coins FROM users WHERE encrypted_yw_id = ?), 0) + ?,
        COALESCE((SELECT flower_meta FROM users WHERE encrypted_yw_id = ?), 0) + ?,
        CASE 
          WHEN (COALESCE((SELECT flower_coins FROM users WHERE encrypted_yw_id = ?), 0) + ?) >= 100
          THEN ((COALESCE((SELECT flower_coins FROM users WHERE encrypted_yw_id = ?), 0) + ?) / 100) + 1
          ELSE 1
        END,
        CURRENT_TIMESTAMP
      )
    `);
    const { success } = await updateStmt.bind(
      userId,
      userId,
      task.flower_coins,
      userId,
      task.flower_meta,
      userId,
      task.flower_coins,
      userId,
      task.flower_coins
    ).run();
    if (!success) {
      throw new Error("Failed to complete task");
    }
    const { results: updatedUser } = await db.prepare("SELECT * FROM users WHERE encrypted_yw_id = ?").bind(userId).all();
    return new Response(JSON.stringify({
      success: true,
      message: "Task completed successfully",
      pointsEarned: task.flower_coins,
      metaEarned: task.flower_meta,
      user: updatedUser[0]
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error3) {
    console.error("Complete task error:", error3);
    return new Response(JSON.stringify({ error: "Failed to complete task" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
__name(completeTask, "completeTask");
async function createTask3(db, userId, body, corsHeaders) {
  if (!userId) {
    return new Response(JSON.stringify({ error: "User not authenticated" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  const { title: title2, description, type = "daily", priority = "medium", flower_coins = 10, flower_meta = 0 } = body;
  if (!title2) {
    return new Response(JSON.stringify({ error: "Task title required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  try {
    const { success } = await db.prepare(`
      INSERT INTO tasks (title, description, type, priority, flower_coins, flower_meta, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(title2, description, type, priority, flower_coins, flower_meta).run();
    if (!success) {
      throw new Error("Failed to create task");
    }
    return new Response(JSON.stringify({
      success: true,
      message: "Task created successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error3) {
    console.error("Create task error:", error3);
    return new Response(JSON.stringify({ error: "Failed to create task" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
__name(createTask3, "createTask");
async function getRanking(db, corsHeaders) {
  try {
    const { results } = await db.prepare(`
      SELECT 
        encrypted_yw_id as user_id,
        display_name,
        profile_photo,
        flower_coins,
        flower_meta,
        level,
        ROW_NUMBER() OVER (ORDER BY flower_coins DESC, flower_meta DESC) as rank
      FROM users 
      WHERE flower_coins > 0 OR flower_meta > 0
      ORDER BY flower_coins DESC, flower_meta DESC 
      LIMIT 50
    `).all();
    return new Response(JSON.stringify({
      success: true,
      ranking: results
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error3) {
    console.error("Get ranking error:", error3);
    return new Response(JSON.stringify({ error: "Failed to get ranking" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
__name(getRanking, "getRanking");
async function updateUserPhoto(db, userId, body, corsHeaders) {
  if (!userId) {
    return new Response(JSON.stringify({ error: "User not authenticated" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  const { photoData } = body;
  if (!photoData) {
    return new Response(JSON.stringify({ error: "Photo data required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  try {
    if (!photoData.startsWith("data:image/")) {
      return new Response(JSON.stringify({ error: "Invalid image format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    if (photoData.length > 2e6) {
      return new Response(JSON.stringify({ error: "Image too large. Please use an image smaller than 1.5MB." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const existingUser = await db.prepare(
      "SELECT id FROM users WHERE encrypted_yw_id = ?"
    ).bind(userId).first();
    if (!existingUser) {
      const { success } = await db.prepare(`
        INSERT INTO users (encrypted_yw_id, profile_photo, created_at, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).bind(userId, photoData).run();
      if (!success) {
        throw new Error("Failed to create user with photo");
      }
    } else {
      const { success } = await db.prepare(`
        UPDATE users 
        SET profile_photo = ?, updated_at = CURRENT_TIMESTAMP
        WHERE encrypted_yw_id = ?
      `).bind(photoData, userId).run();
      if (!success) {
        throw new Error("Failed to update photo");
      }
    }
    return new Response(JSON.stringify({
      success: true,
      message: "Foto de perfil salva com sucesso!"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error3) {
    console.error("Update photo error:", error3);
    return new Response(JSON.stringify({
      success: false,
      error: "Erro interno do servidor ao salvar foto"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
__name(updateUserPhoto, "updateUserPhoto");
async function getMonthlyPoints(db, userId, month, year, corsHeaders) {
  if (!userId) {
    return new Response(JSON.stringify({ error: "User not authenticated" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  try {
    let query, params;
    if (month && year) {
      query = "SELECT * FROM monthly_points WHERE user_id = ? AND month = ? AND year = ?";
      params = [userId, parseInt(month), parseInt(year)];
    } else {
      query = "SELECT * FROM monthly_points WHERE user_id = ? ORDER BY year DESC, month DESC";
      params = [userId];
    }
    const { results } = await db.prepare(query).bind(...params).all();
    return new Response(JSON.stringify({
      success: true,
      monthlyPoints: results
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error3) {
    console.error("Get monthly points error:", error3);
    return new Response(JSON.stringify({ error: "Failed to get monthly points" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
__name(getMonthlyPoints, "getMonthlyPoints");
async function performMonthlyReset(db, corsHeaders) {
  try {
    const now = /* @__PURE__ */ new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const { results: users } = await db.prepare(`
      SELECT encrypted_yw_id, flower_coins, flower_meta 
      FROM users 
      WHERE flower_coins > 0 OR flower_meta > 0
    `).all();
    if (users.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: "No users to reset"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const statements = [];
    for (const user of users) {
      statements.push(
        db.prepare(`
          INSERT OR REPLACE INTO monthly_points (user_id, month, year, flower_coins, flower_meta, created_at)
          VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `).bind(user.encrypted_yw_id, currentMonth, currentYear, user.flower_coins, user.flower_meta)
      );
      statements.push(
        db.prepare(`
          UPDATE users 
          SET flower_coins = 0, flower_meta = 0, updated_at = CURRENT_TIMESTAMP 
          WHERE encrypted_yw_id = ?
        `).bind(user.encrypted_yw_id)
      );
    }
    const batchResults = await db.batch(statements);
    if (batchResults.some((r) => !r.success)) {
      throw new Error("Failed to complete monthly reset");
    }
    return new Response(JSON.stringify({
      success: true,
      message: `Monthly reset completed for ${users.length} users`,
      month: currentMonth,
      year: currentYear
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error3) {
    console.error("Monthly reset error:", error3);
    return new Response(JSON.stringify({ error: "Failed to perform monthly reset" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
__name(performMonthlyReset, "performMonthlyReset");
async function getUserList(db, corsHeaders) {
  try {
    const { results } = await db.prepare(`
      SELECT encrypted_yw_id, display_name, flower_coins, flower_meta, level, created_at
      FROM users 
      ORDER BY flower_coins DESC, created_at DESC
    `).all();
    return new Response(JSON.stringify({
      success: true,
      users: results
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error3) {
    console.error("Get user list error:", error3);
    return new Response(JSON.stringify({ error: "Failed to get user list" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
__name(getUserList, "getUserList");
async function createDistributionHistoryTable(db) {
  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS distribution_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        admin_id TEXT NOT NULL,
        type TEXT NOT NULL, -- 'add' or 'deduct'
        point_type TEXT NOT NULL, -- 'flower_coins' or 'flower_meta'
        amount INTEGER NOT NULL,
        reason TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      ) STRICT
    `).run();
  } catch (error3) {
    console.error("Error creating distribution_history table:", error3);
  }
}
__name(createDistributionHistoryTable, "createDistributionHistoryTable");
async function getDistributionHistory(db, corsHeaders) {
  try {
    await createDistributionHistoryTable(db);
    const { results } = await db.prepare(`
      SELECT dh.*, u.display_name as user_name
      FROM distribution_history dh
      LEFT JOIN users u ON dh.user_id = u.encrypted_yw_id
      ORDER BY dh.created_at DESC
      LIMIT 50
    `).all();
    return new Response(JSON.stringify({
      success: true,
      history: results
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error3) {
    console.error("Get distribution history error:", error3);
    return new Response(JSON.stringify({ error: "Failed to get distribution history" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
__name(getDistributionHistory, "getDistributionHistory");
async function updateUserPoints(db, adminId, body, corsHeaders) {
  if (!adminId) {
    return new Response(JSON.stringify({ error: "Admin not authenticated" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  const { userId, type, pointType, amount, reason } = body;
  if (!userId || !type || !pointType || !amount) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  try {
    await createDistributionHistoryTable(db);
    const pointField = pointType === "flower_coins" ? "flower_coins" : "flower_meta";
    const operation = type === "add" ? "+" : "-";
    const updateUserStmt = db.prepare(`
      UPDATE users 
      SET ${pointField} = MAX(0, ${pointField} ${operation} ?), updated_at = CURRENT_TIMESTAMP 
      WHERE encrypted_yw_id = ?
    `);
    const logHistoryStmt = db.prepare(`
      INSERT INTO distribution_history (user_id, admin_id, type, point_type, amount, reason, created_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    const batchResults = await db.batch([
      updateUserStmt.bind(amount, userId),
      logHistoryStmt.bind(userId, adminId, type, pointType, amount, reason || "")
    ]);
    if (batchResults.some((r) => !r.success)) {
      throw new Error("Failed to update points");
    }
    return new Response(JSON.stringify({
      success: true,
      message: `Points ${type === "add" ? "added" : "deducted"} successfully`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error3) {
    console.error("Update user points error:", error3);
    return new Response(JSON.stringify({ error: "Failed to update points" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
__name(updateUserPoints, "updateUserPoints");
async function updateUserName(db, userId, body, corsHeaders) {
  if (!userId) {
    return new Response(JSON.stringify({ error: "User not authenticated" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  const { display_name } = body;
  if (!display_name) {
    return new Response(JSON.stringify({ error: "Display name required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  try {
    const { success } = await db.prepare(`
      INSERT OR REPLACE INTO users (encrypted_yw_id, display_name, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `).bind(userId, display_name).run();
    if (!success) {
      throw new Error("Failed to update name");
    }
    return new Response(JSON.stringify({
      success: true,
      message: "Name updated successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error3) {
    console.error("Update name error:", error3);
    return new Response(JSON.stringify({ error: "Failed to update name" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
__name(updateUserName, "updateUserName");
async function ensureMetaIndTables(db) {
  try {
    if (!db || typeof db.prepare !== "function") {
      throw new Error("DB not initialized");
    }
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS meta_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        points INTEGER DEFAULT 0,
        assigned_to_user_id TEXT,
        is_completed INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        completed_at TEXT
      ) STRICT
    `).run();
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS ind_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        points INTEGER DEFAULT 0,
        assigned_to_user_id TEXT,
        is_completed INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        completed_at TEXT
      ) STRICT
    `).run();
  } catch (e) {
    console.error("ensureMetaIndTables error:", e);
    throw e;
  }
}
__name(ensureMetaIndTables, "ensureMetaIndTables");
async function getMetaTasks(db, corsHeaders, userId) {
  try {
    await ensureMetaIndTables(db);
    let stmt = db.prepare("SELECT * FROM meta_tasks WHERE is_active = 1 ORDER BY created_at DESC");
    if (userId)
      stmt = db.prepare("SELECT * FROM meta_tasks WHERE assigned_to_user_id = ? ORDER BY created_at DESC").bind(userId);
    const { results } = await stmt.all();
    return new Response(JSON.stringify({ success: true, tasks: results }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("getMetaTasks error:", e);
    return new Response(JSON.stringify({ error: "Failed to get meta tasks" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
}
__name(getMetaTasks, "getMetaTasks");
async function createMetaTasks(db, body, corsHeaders) {
  try {
    await ensureMetaIndTables(db);
    const rawItems = Array.isArray(body.items) ? body.items : [];
    const items = rawItems.map((it) => ({
      title: String(it.title || "").trim(),
      description: String(it.description || ""),
      points: parseInt(it.points || 0, 10),
      assigned_to_user_id: String(it.assigned_to_user_id || "").trim()
    })).filter((it) => it.title.length > 0 && Number.isFinite(it.points) && it.points > 0 && it.assigned_to_user_id.length > 0);
    if (!items.length) {
      return new Response(JSON.stringify({ success: false, error: "No valid items provided" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    let inserted = 0;
    const errors = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      try {
        const r = await db.prepare(
          "INSERT INTO meta_tasks (title, description, points, assigned_to_user_id, is_completed, is_active, created_at) VALUES (?, ?, ?, ?, 0, 1, CURRENT_TIMESTAMP)"
        ).bind(it.title, it.description, it.points, it.assigned_to_user_id).run();
        if (r && r.success) {
          inserted += 1;
        } else {
          errors.push({ index: i, user_id: it.assigned_to_user_id, title: it.title, message: "Insert returned unsuccess" });
        }
      } catch (err) {
        errors.push({ index: i, user_id: it.assigned_to_user_id, title: it.title, message: err?.message || String(err) });
      }
    }
    return new Response(JSON.stringify({ success: errors.length === 0, inserted, requested: items.length, errors }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("createMetaTasks error:", e);
    return new Response(JSON.stringify({ success: false, error: e?.message || "Failed to create meta tasks" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
}
__name(createMetaTasks, "createMetaTasks");
async function getIndTasks(db, corsHeaders, userId) {
  try {
    await ensureMetaIndTables(db);
    let stmt = db.prepare("SELECT * FROM ind_tasks WHERE is_active = 1 ORDER BY created_at DESC");
    if (userId)
      stmt = db.prepare("SELECT * FROM ind_tasks WHERE assigned_to_user_id = ? ORDER BY created_at DESC").bind(userId);
    const { results } = await stmt.all();
    return new Response(JSON.stringify({ success: true, tasks: results }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("getIndTasks error:", e);
    return new Response(JSON.stringify({ error: "Failed to get IND tasks" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
}
__name(getIndTasks, "getIndTasks");
async function createIndTasks(db, body, corsHeaders) {
  try {
    await ensureMetaIndTables(db);
    const rawItems = Array.isArray(body.items) ? body.items : [];
    const items = rawItems.map((it) => ({
      title: String(it.title || "").trim(),
      description: String(it.description || ""),
      points: parseInt(it.points || 0, 10),
      assigned_to_user_id: String(it.assigned_to_user_id || "").trim()
    })).filter((it) => it.title.length > 0 && Number.isFinite(it.points) && it.points > 0 && it.assigned_to_user_id.length > 0);
    if (!items.length) {
      return new Response(JSON.stringify({ success: false, error: "No valid items provided" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    let inserted = 0;
    const errors = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      try {
        const r = await db.prepare(
          "INSERT INTO ind_tasks (title, description, points, assigned_to_user_id, is_completed, is_active, created_at) VALUES (?, ?, ?, ?, 0, 1, CURRENT_TIMESTAMP)"
        ).bind(it.title, it.description, it.points, it.assigned_to_user_id).run();
        if (r && r.success) {
          inserted += 1;
        } else {
          errors.push({ index: i, user_id: it.assigned_to_user_id, title: it.title, message: "Insert returned unsuccess" });
        }
      } catch (err) {
        errors.push({ index: i, user_id: it.assigned_to_user_id, title: it.title, message: err?.message || String(err) });
      }
    }
    return new Response(JSON.stringify({ success: errors.length === 0, inserted, requested: items.length, errors }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("createIndTasks error:", e);
    return new Response(JSON.stringify({ success: false, error: e?.message || "Failed to create IND tasks" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
}
__name(createIndTasks, "createIndTasks");
export {
  src_default as default
};
//# sourceMappingURL=index.js.map
