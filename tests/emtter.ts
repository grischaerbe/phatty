import { EventEmitter } from 'eventemitter3'

export class MockEventEmitter extends EventEmitter {}

export const createEventEmitter = () => {
  const e = new EventEmitter()
  return e as unknown as Phaser.Events.EventEmitter
}
