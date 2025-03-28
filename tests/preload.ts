import { mock } from 'bun:test'
import { MockEventEmitter } from './emitter'

mock.module('phaser', () => {
  return {
    Events: {
      EventEmitter: MockEventEmitter
    }
  }
})
