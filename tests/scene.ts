import { EntitySystem } from '../src/EntitySystem'
import type { Scene } from '../src/Scene'
import { createEventEmitter } from './emtter'

class MockScene {
  sys: {
    events: Phaser.Events.EventEmitter
  }
  entities: EntitySystem

  constructor() {
    this.sys = {
      events: createEventEmitter()
    }
    this.entities = new EntitySystem(this as unknown as Scene)
    this.entities.setup()
  }
}

export const createMockScene = () => {
  const scene = new MockScene()
  return scene as unknown as Scene
}
