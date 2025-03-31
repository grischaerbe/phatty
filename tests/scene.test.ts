import { createEventEmitter } from './emtter.test'

class MockScene {
  sys: {
    events: Phaser.Events.EventEmitter
  }

  constructor() {
    this.sys = {
      events: createEventEmitter()
    }
  }
}

export const createMockScene = () => {
  const scene = new MockScene()
  return scene as unknown as Phaser.Scene
}
