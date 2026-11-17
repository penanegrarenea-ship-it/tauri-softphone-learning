// @vitest-environment happy-dom
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App.vue';
const clickText = async (wrapper: ReturnType<typeof mount>, text: string) => {
  const button = wrapper.findAll('button').find(b => b.text() === text);
  if (!button) throw new Error(`Missing button: ${text}`);
  await button.trigger('click');
};
afterEach(() => vi.useRealTimers());
describe('模拟软电话交互', () => {
  it('接通、静音、导航中挂断、保存记录', async () => {
    vi.useFakeTimers(); const wrapper = mount(App);
    await wrapper.get('#number').setValue('1002');
    await wrapper.get('.call-button').trigger('click');
    await vi.advanceTimersByTimeAsync(2200);
    expect(wrapper.text()).toContain('模拟通话中');
    expect(wrapper.text()).toContain('00:01');
    await clickText(wrapper, '静音');
    expect(wrapper.text()).toContain('已静音');
    await wrapper.findAll('nav button')[1]!.trigger('click');
    await clickText(wrapper, '结束');
    expect(wrapper.findAll('.history-row')).toHaveLength(1);
    expect(wrapper.get('.history-row').text()).toContain('1002');
    wrapper.unmount();
  });
  it('连接前挂断不会延迟接通；空号码不可拨号', async () => {
    vi.useFakeTimers(); const wrapper = mount(App);
    expect(wrapper.get('.call-button').attributes('disabled')).toBeDefined();
    await wrapper.get('#number').setValue('1001');
    await wrapper.get('.call-button').trigger('click');
    await clickText(wrapper, '结束');
    await vi.advanceTimersByTimeAsync(2500);
    expect(wrapper.text()).not.toContain('模拟通话中');
    expect(wrapper.find('.call-button').exists()).toBe(true);
    wrapper.unmount();
  });
  it('联系人无结果与浏览器 Rust 降级提示', async () => {
    const wrapper = mount(App);
    await wrapper.findAll('nav button')[2]!.trigger('click');
    await wrapper.get('[aria-label="搜索联系人"]').setValue('不存在');
    expect(wrapper.text()).toContain('没有匹配的联系人');
    await wrapper.findAll('nav button')[3]!.trigger('click');
    await clickText(wrapper, '检查运行环境');
    expect(wrapper.text()).toContain('当前为浏览器预览');
    wrapper.unmount();
  });
});
