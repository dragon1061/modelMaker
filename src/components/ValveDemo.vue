<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import Valve2DCanvas from './Valve2DCanvas.vue'
import Valve3DViewer from './Valve3DViewer.vue'
import type { ValveModel, ValveParams } from '../core/types'
import { validateParams } from '../core/validate'
import { buildValveModel } from '../core/buildModel'

const params = reactive<ValveParams>({
  dn: 80,
  h: 220,
  df: 200,
  t: 18,
})

const errors = ref<string[]>([])
const model = ref<ValveModel | null>(null)

const canGenerate = computed(() => validateParams(params).ok)

const fields = [
  { key: 'dn',  label: '口径',     abbr: 'Dn', unit: 'mm', min: 1 },
  { key: 'h',   label: '高度',     abbr: 'H',  unit: 'mm', min: 1 },
  { key: 'df',  label: '法兰外径', abbr: 'Df', unit: 'mm', min: 1 },
  { key: 't',   label: '厚度',     abbr: 't',  unit: 'mm', min: 1 },
]

function generate() {
  const v = validateParams(params)
  errors.value = v.errors
  if (!v.ok) {
    model.value = null
    return
  }
  model.value = buildValveModel({ ...params })
}
</script>

<template>
  <div class="page">

    <!-- ── Top bar ── -->
    <header class="topbar">
      <div class="brand">
        <div class="brand-icon">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8" stroke="var(--amber)" stroke-width="1.5"/>
            <circle cx="10" cy="10" r="4" stroke="var(--amber)" stroke-width="1" opacity="0.6"/>
            <line x1="10" y1="2" x2="10" y2="5" stroke="var(--amber)" stroke-width="1.5"/>
            <line x1="10" y1="15" x2="10" y2="18" stroke="var(--amber)" stroke-width="1.5"/>
            <line x1="2" y1="10" x2="5" y2="10" stroke="var(--amber)" stroke-width="1.5"/>
            <line x1="15" y1="10" x2="18" y2="10" stroke="var(--amber)" stroke-width="1.5"/>
          </svg>
        </div>
        <div class="brand-text">
          <span class="brand-title">VALVE<span class="brand-accent"> PARAMETRIC</span></span>
          <span class="brand-sub">2D / 3D PREVIEW SYSTEM</span>
        </div>
      </div>
      <div class="topbar-right">
        <div class="status-dot"></div>
        <span class="status-label">SYSTEM READY</span>
      </div>
    </header>

    <!-- ── Params panel ── -->
    <div class="param-bar">
      <div class="param-bar-label">
        <span class="section-tag">§01</span>
        <span>PARAMETERS</span>
      </div>
      <div class="form">
        <div class="field" v-for="field in fields" :key="field.key">
          <div class="field-meta">
            <span class="field-label">{{ field.label }}</span>
            <span class="field-unit">{{ field.unit }}</span>
          </div>
          <div class="field-input-wrap">
            <span class="field-abbr">{{ field.abbr }}</span>
            <input
              v-model.number="(params as any)[field.key]"
              type="number"
              :min="field.min"
              step="1"
              class="field-input"
            />
          </div>
        </div>

        <button class="btn-generate" :disabled="!canGenerate" @click="generate">
          <span class="btn-icon">▶</span>
          <span>GENERATE</span>
        </button>
      </div>
    </div>

    <!-- ── Errors ── -->
    <div v-if="errors.length" class="error-bar">
      <span class="error-icon">⚠</span>
      <div class="error-list">
        <span v-for="(e, i) in errors" :key="i">{{ e }}</span>
      </div>
    </div>

    <!-- ── Main panels ── -->
    <main class="main">
      <section class="panel">
        <div class="panel-header">
          <span class="section-tag">§02</span>
          <span class="panel-title">2D ENGINEERING DRAWING</span>
          <span class="panel-badge">CANVAS</span>
          <div class="panel-corner"></div>
        </div>
        <div class="panel-body">
          <Valve2DCanvas :model="model" />
        </div>
      </section>

      <section class="panel">
        <div class="panel-header">
          <span class="section-tag">§03</span>
          <span class="panel-title">3D MODEL VIEWER</span>
          <span class="panel-badge">THREE.JS</span>
          <div class="panel-corner"></div>
        </div>
        <div class="panel-body">
          <Valve3DViewer :model="model" />
        </div>
      </section>
    </main>

  </div>
</template>

<script lang="ts">
// field definitions for future extensibility
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _fields = [
  { key: 'dn',  label: '口径',    abbr: 'Dn', unit: 'mm', min: 1 },
  { key: 'h',   label: '高度',    abbr: 'H',  unit: 'mm', min: 1 },
  { key: 'df',  label: '法兰外径', abbr: 'Df', unit: 'mm', min: 1 },
  { key: 't',   label: '厚度',    abbr: 't',  unit: 'mm', min: 1 },
]
</script>

<style scoped>
/* ─────────────────────────────────────────
   Layout
───────────────────────────────────────── */
.page {
  height: 100vh;
  display: grid;
  grid-template-rows: auto auto auto 1fr;
  gap: 0;
  padding: 12px 14px;
  box-sizing: border-box;
  width: 100%;
}

/* ─────────────────────────────────────────
   Top bar
───────────────────────────────────────── */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  margin-bottom: 10px;
  background: var(--bg-surface);
  border: 1px solid var(--border-mid);
  border-top: 2px solid var(--amber);
  position: relative;
}
.topbar::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, var(--amber-glow) 0%, transparent 40%);
  pointer-events: none;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}
.brand-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--amber-glow);
  border: 1px solid var(--amber-dim);
}
.brand-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.brand-title {
  font-family: 'Rajdhani', sans-serif;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--text-primary);
}
.brand-accent {
  color: var(--amber);
}
.brand-sub {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  letter-spacing: 0.18em;
  color: var(--text-muted);
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--teal);
  box-shadow: 0 0 8px var(--teal);
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 8px var(--teal); }
  50%       { opacity: 0.5; box-shadow: 0 0 3px var(--teal); }
}
.status-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.14em;
  color: var(--teal);
}

/* ─────────────────────────────────────────
   Param bar
───────────────────────────────────────── */
.param-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 16px;
  margin-bottom: 10px;
  background: var(--bg-surface);
  border: 1px solid var(--border-mid);
  border-left: 3px solid var(--amber-dim);
}

.param-bar-label {
  display: flex;
  flex-direction: column;
  gap: 3px;
  white-space: nowrap;
  flex-shrink: 0;
}
.param-bar-label > span:last-child {
  font-family: 'Rajdhani', sans-serif;
  font-size: 11px;
  letter-spacing: 0.14em;
  font-weight: 600;
  color: var(--text-secondary);
}

.section-tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  color: var(--amber);
  letter-spacing: 0.1em;
  opacity: 0.8;
}

.form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: flex-end;
  flex: 1;
  min-width: 0;
}

/* ── Field ── */
.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 0 1 150px;
  min-width: 130px;
}
.field-meta {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.field-label {
  font-size: 11px;
  color: var(--text-secondary);
  letter-spacing: 0.04em;
}
.field-unit {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  color: var(--text-muted);
  letter-spacing: 0.08em;
  background: var(--border-dim);
  padding: 1px 4px;
}

.field-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.field-abbr {
  position: absolute;
  left: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--amber-dim);
  pointer-events: none;
  z-index: 1;
  font-style: italic;
}
.field-input {
  width: 100%;
  height: 30px;
  padding: 0 8px 0 28px;
  box-sizing: border-box;
  background: var(--bg-input);
  border: 1px solid var(--border-mid);
  border-bottom: 1px solid var(--border-hi);
  color: var(--text-primary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  border-radius: 0;
  -moz-appearance: textfield;
}
.field-input::-webkit-inner-spin-button,
.field-input::-webkit-outer-spin-button { -webkit-appearance: none; }
.field-input:focus {
  border-color: var(--amber-dim);
  box-shadow: inset 0 0 0 1px var(--amber-glow), 0 0 12px var(--amber-glow);
}

/* ── Generate button ── */
.btn-generate {
  height: 30px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: 1px solid var(--amber);
  color: var(--amber);
  font-family: 'Rajdhani', sans-serif;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.15em;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: background 0.2s, box-shadow 0.2s;
  flex-shrink: 0;
  border-radius: 0;
}
.btn-generate::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--amber);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.2s ease;
  z-index: 0;
}
.btn-generate:hover:not(:disabled)::before { transform: scaleX(1); }
.btn-generate:hover:not(:disabled) { color: #0b0e14; box-shadow: 0 0 20px var(--amber-glow); }
.btn-generate > * { position: relative; z-index: 1; }
.btn-icon { font-size: 10px; }
.btn-generate:disabled { opacity: 0.3; cursor: not-allowed; }

/* ─────────────────────────────────────────
   Error bar
───────────────────────────────────────── */
.error-bar {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 9px 14px;
  margin-bottom: 10px;
  background: var(--red-bg);
  border: 1px solid var(--red-border);
  border-left: 3px solid var(--red);
  color: var(--red);
  font-size: 12px;
}
.error-icon {
  font-size: 14px;
  flex-shrink: 0;
  margin-top: 1px;
}
.error-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  line-height: 1.6;
}

/* ─────────────────────────────────────────
   Main panels
───────────────────────────────────────── */
.main {
  min-height: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.panel {
  min-height: 0;
  display: grid;
  grid-template-rows: auto 1fr;
  background: var(--bg-panel);
  border: 1px solid var(--border-mid);
  position: relative;
  overflow: hidden;
}

/* corner decoration */
.panel::after {
  content: '';
  position: absolute;
  top: 0; right: 0;
  width: 0; height: 0;
  border-style: solid;
  border-width: 0 18px 18px 0;
  border-color: transparent var(--amber-dim) transparent transparent;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-bottom: 1px solid var(--border-mid);
  background: var(--bg-surface);
  position: relative;
}
.panel-header::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  background: var(--amber-dim);
}

.panel-title {
  font-family: 'Rajdhani', sans-serif;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.14em;
  color: var(--text-primary);
  flex: 1;
}
.panel-badge {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  letter-spacing: 0.12em;
  color: var(--teal);
  border: 1px solid rgba(0,217,180,0.3);
  padding: 1px 6px;
  background: var(--teal-glow);
}

.panel-body {
  min-height: 0;
  padding: 8px;
  height: 100%;
  box-sizing: border-box;
}

/* ─────────────────────────────────────────
   Responsive
───────────────────────────────────────── */
@media (max-width: 980px) {
  .param-bar { flex-direction: column; align-items: flex-start; }
  .main { grid-template-columns: 1fr; }
}
</style>
