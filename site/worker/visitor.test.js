import { test } from 'node:test'
import assert from 'node:assert/strict'
import { visitorKey } from './visitor.js'

test('IPv4 addresses are used as they are', () => {
  assert.equal(visitorKey('203.0.113.7'), '203.0.113.7')
  assert.equal(visitorKey(' 203.0.113.7 '), '203.0.113.7')
})

test('IPv6 addresses from the same /64 are one visitor, different /64s are different', () => {
  const a = visitorKey('2001:db8:abcd:12:1:2:3:4')
  assert.equal(a, '2001:0db8:abcd:0012::/64')
  assert.equal(visitorKey('2001:db8:abcd:12:ffff:ffff:ffff:ffff'), a)
  assert.equal(visitorKey('2001:DB8:ABCD:12::1'), a)
  assert.equal(visitorKey('2001:db8:abcd:12::'), a)
  assert.notEqual(visitorKey('2001:db8:abcd:13::1'), a)
})

test('short forms mean the same as the long ones', () => {
  assert.equal(visitorKey('2001:db8::1'), visitorKey('2001:0db8:0000:0000:0000:0000:0000:0001'))
  assert.equal(visitorKey('::1'), '0000:0000:0000:0000::/64')
  assert.equal(visitorKey('fe80::1%eth0'), visitorKey('fe80::2'))
})

test('an IPv4 address written the IPv6 way is treated as IPv4', () => {
  assert.equal(visitorKey('::ffff:203.0.113.7'), '203.0.113.7')
})

test('empty or unreadable input never throws', () => {
  assert.equal(visitorKey(''), '')
  assert.equal(visitorKey(undefined), '')
  assert.equal(visitorKey('not:an:address'), 'not:an:address')
  assert.equal(visitorKey('1:2:3:4:5:6:7:8:9'), '1:2:3:4:5:6:7:8:9')
})
