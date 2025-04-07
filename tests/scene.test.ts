import { EntitySystem } from '../src/EntitySystem'
import type { Scene } from '../src/Scene'
import { createEventEmitter } from './emtter.test'

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
  }
}

export const createMockScene = () => {
  const scene = new MockScene()
  return scene as unknown as Scene
}
