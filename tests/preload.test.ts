import { mock } from 'bun:test'
import { MockEventEmitter } from './emtter.test'

mock.module('phaser', () => {
  return {
    Events: {
      EventEmitter: MockEventEmitter
    }
  }
})
