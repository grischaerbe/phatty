import { mock } from 'bun:test'
import { MockEventEmitter } from './emtter'

// class MockScene {}

mock.module('phaser', () => {
  return {
    // Scene: MockScene,
    Events: {
      EventEmitter: MockEventEmitter
    }
  }
})
