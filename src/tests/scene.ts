import { MockEventEmitter } from 'src/tests/emitter'

class MockScene {
  sys: {
    events: MockEventEmitter
  }

  constructor() {
    this.sys = {
      events: new MockEventEmitter()
    }
  }
}

export const createMockScene = () => {
  const scene = new MockScene()
  return scene as unknown as Phaser.Scene
}
