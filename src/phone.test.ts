import { describe, expect, it } from 'vitest';
import { normalizeNumber, formatDuration } from './phone';
describe('拨号数据工具', () => {
  it('保留数字和拨号符号，过滤其他字符', () => expect(normalizeNumber('+86 (010) abc*#')).toBe('+86010*#'));
  it('限制号码长度', () => expect(normalizeNumber('1'.repeat(40))).toHaveLength(24));
  it('格式化通话时长', () => { expect(formatDuration(0)).toBe('00:00'); expect(formatDuration(125)).toBe('02:05'); });
});
