import { EventEmitter } from 'eventemitter3'

export class MockEventEmitter extends EventEmitter {
  constructor() {
    super()
  }
}
