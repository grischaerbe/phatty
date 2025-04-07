import { mock } from 'bun:test'
import { MockEventEmitter } from './emtter.test'

// class MockScene {}

mock.module('phaser', () => {
  return {
    // Scene: MockScene,
    Events: {
      EventEmitter: MockEventEmitter
    }
  }
})
