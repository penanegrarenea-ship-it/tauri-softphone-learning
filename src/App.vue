<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue';
import { invoke, isTauri } from '@tauri-apps/api/core';
import { formatDuration, normalizeNumber, type CallState, type CallRecord } from './phone';
import './style.css';
const tab = ref('拨号');
const tabs = [{ name: '拨号', icon: '⌘' }, { name: '通话记录', icon: '◷' }, { name: '联系人', icon: '◎' }, { name: '设置', icon: '⚙' }];
const number = ref('');
const state = ref<CallState>('idle');
const seconds = ref(0);
const muted = ref(false);
const speaker = ref(false);
const history = ref<CallRecord[]>([]);
const search = ref('');
const contacts = [{ name: '产品讨论室', number: '1001', role: '演示联系人' }, { name: '技术支持', number: '1002', role: '演示联系人' }, { name: '前台', number: '1000', role: '演示联系人' }];
const filtered = computed(() => contacts.filter(c => `${c.name}${c.number}`.includes(search.value)));
const account = ref('1001'); const server = ref('sip.example.com'); const notice = ref('');
let connectTimer: ReturnType<typeof setTimeout> | undefined;
let clock: ReturnType<typeof setInterval> | undefined;
function clearTimers() { clearTimeout(connectTimer); clearInterval(clock); }
function call() {
  if (!number.value || state.value !== 'idle') return;
  state.value = 'dialing'; seconds.value = 0; muted.value = false; speaker.value = false;
  connectTimer = setTimeout(() => { state.value = 'connected'; clock = setInterval(() => seconds.value++, 1000); }, 1200);
}
function hangup() {
  if (state.value === 'idle') return;
  clearTimers();
  history.value.unshift({ number: number.value, time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }), duration: seconds.value });
  state.value = 'idle'; muted.value = false; speaker.value = false;
}
function selectNumber(value: string) { if (state.value !== 'idle') return; number.value = value; tab.value = '拨号'; }
async function checkRuntime() {
  notice.value = isTauri() ? await invoke<string>('runtime_info').catch(() => 'Rust 调用失败，请检查开发终端日志') : '当前为浏览器预览。使用 npm run tauri dev 验证 Rust 通信。';
}
onUnmounted(clearTimers);
</script>

<template>
  <div class="shell">
    <aside class="sidebar">
      <a class="brand" href="#" @click.prevent="tab = '拨号'"><span class="logo">s</span><span>Softline<small>你的桌面软电话</small></span></a>
      <div class="nav-label">工作空间</div>
      <nav aria-label="主要导航"><button v-for="item in tabs" :key="item.name" :class="{ active: tab === item.name }" @click="tab = item.name"><span>{{ item.icon }}</span>{{ item.name }}</button></nav>
      <div class="sidebar-bottom"><div class="avatar">D</div><div>演示工作区<small><i class="dot"></i>本地模拟模式</small></div></div>
    </aside>
    <main>
      <header><div><p class="eyebrow">SOFTLINE / WORKSPACE</p><h1>{{ tab }}</h1></div><span class="badge"><i class="dot"></i>界面演示 · 未连接 SIP</span></header>
      <div v-if="state !== 'idle' && tab !== '拨号'" class="ongoing" role="status">正在模拟与 {{ number }} 通话 <button @click="tab = '拨号'">返回通话</button><button @click="hangup">结束</button></div>
      <section v-if="tab === '拨号'" class="dial-layout">
        <div class="dial-card">
          <div class="card-top"><span>发起新通话</span><span class="tiny-label">DEMO</span></div>
          <div class="number-zone"><label for="number">{{ state === 'idle' ? '输入号码，开始一段对话' : state === 'dialing' ? '正在模拟呼叫…' : '模拟通话中' }}</label><input id="number" :value="number" @input="number = normalizeNumber(($event.target as HTMLInputElement).value)" :disabled="state !== 'idle'" inputmode="tel" autocomplete="off" placeholder="输入电话号码" aria-label="电话号码" @keydown.enter="call"><div class="duration" aria-live="polite">{{ state === 'connected' ? formatDuration(seconds) : '本演示不会发起真实呼叫' }}</div></div>
          <div class="keypad"><button v-for="(key, index) in ['1','2','3','4','5','6','7','8','9','*','0','#']" :key="key" :disabled="state !== 'idle'" @click="number = normalizeNumber(number + key)"><b>{{ key }}</b><small>{{ ['', 'ABC', 'DEF', 'GHI', 'JKL', 'MNO', 'PQRS', 'TUV', 'WXYZ', '', '+', ''][index] }}</small></button></div>
          <div class="call-actions" v-if="state === 'idle'"><button class="aux" @click="number = ''" :disabled="!number" aria-label="清空号码">清空</button><button class="call-button" @click="call" :disabled="!number">☎ <span>模拟拨打</span></button><button class="aux" @click="number = number.slice(0,-1)" :disabled="!number" aria-label="删除最后一位">⌫</button></div>
          <div v-else class="in-call"><button :class="{ selected: muted }" @click="muted = !muted" :aria-pressed="muted">{{ muted ? '已静音' : '静音' }}</button><button class="end" @click="hangup">结束</button><button :class="{ selected: speaker }" @click="speaker = !speaker" :aria-pressed="speaker">{{ speaker ? '扬声器开' : '扬声器' }}</button></div>
          <p class="dial-footer">{{ state === 'idle' ? '支持键盘输入 · Enter 开始模拟' : '静音与扬声器仅演示按钮状态，不访问音频设备' }}</p>
        </div>
        <div class="right-column"><section class="panel"><div class="panel-title"><h2>快捷联系</h2><span>03</span></div><button class="contact-row" v-for="(contact, index) in contacts" :key="contact.number" @click="selectNumber(contact.number)" :disabled="state !== 'idle'"><span class="contact-avatar" :class="`tone-${index}`">{{ contact.name[0] }}</span><span class="contact-text"><b>{{ contact.name }}</b><small>{{ contact.number }} · {{ contact.role }}</small></span><span class="arrow">↗</span></button></section><section class="info-card"><span class="info-symbol">✧</span><h2>先连接界面，再连接世界。</h2><p>一个为桌面与移动设备准备的软电话起点。现在专注交互，下一步接入 SIP 引擎。</p><div class="milestone"><span>01</span><div>界面与交互<small>当前阶段</small></div><b>✓</b></div><div class="milestone muted"><span>02</span><div>SIP 注册与通话<small>后续实现</small></div></div></section></div>
      </section>
      <section v-else-if="tab === '通话记录'" class="panel wide"><h2>本次会话的模拟记录</h2><p class="subtext">记录仅保存在内存中，刷新后清空。</p><div v-if="!history.length" class="empty">◷<h3>还没有通话记录</h3><p>完成一次模拟拨打后，记录会出现在这里。</p><button @click="tab = '拨号'">去拨号</button></div><button v-for="(record, index) in history" :key="index" class="history-row" @click="selectNumber(record.number)" :disabled="state !== 'idle'"><span>↗ <b>{{ record.number }}</b></span><span>{{ record.time }} · {{ formatDuration(record.duration) }} · 模拟</span></button></section>
      <section v-else-if="tab === '联系人'" class="panel wide"><h2>联系人</h2><input class="field" v-model="search" placeholder="搜索姓名或号码" aria-label="搜索联系人"><button class="contact-row" v-for="contact in filtered" :key="contact.number" @click="selectNumber(contact.number)" :disabled="state !== 'idle'"><span class="contact-avatar">{{ contact.name[0] }}</span><span class="contact-text"><b>{{ contact.name }}</b><small>{{ contact.number }} · {{ contact.role }}</small></span><span>↗</span></button><p v-if="!filtered.length" class="empty-text">没有匹配的联系人</p></section>
      <section v-else class="panel wide settings"><h2>SIP 账户占位配置</h2><p class="subtext">这里只演示表单，不保存、不注册、不连接服务器。不要输入真实敏感信息。</p><label>显示账号<input class="field" v-model="account" autocomplete="off"></label><label>SIP 服务器<input class="field" v-model="server" autocomplete="off"></label><button class="primary" @click="notice = '界面配置已确认（仅内存）。尚未实现 SIP 注册。'">确认演示配置</button><hr><h2>前端 ↔ Rust</h2><p class="subtext">通过一个只读命令，学习 Tauri 的 invoke 调用。</p><button class="outline" @click="checkRuntime">检查运行环境</button><p v-if="notice" class="notice" role="status">{{ notice }}</p></section>
      <footer>Softline Starter <span>Vue 3 + TypeScript + Tauri 2</span></footer>
    </main>
  </div>
</template>
