import { describe, expect, it, jest } from 'bun:test'
import { Component } from '../../src/Component'
import { createMockScene } from '../scene.test'

describe('Component', () => {
  it('should create a component', () => {
    const scene = createMockScene()
    const entity = scene.entities.create()
    class TestComponent extends Component {
      constructor(public num: number) {
        super()
      }
    }
    entity.components.add(TestComponent, 2)
    expect(entity).toBeDefined()
  })

  it('should hold a reference to the entity, entity system and the scene', () => {
    const scene = createMockScene()
    const entity = scene.entities.create()
    class TestComponent extends Component {
      constructor() {
        super()
        expect(this.entity).toBeDefined()
        expect(this.entity).toStrictEqual(entity)
        expect(this.scene).toBeDefined()
        expect(this.scene).toStrictEqual(scene)
        expect(this.entities).toBeDefined()
        expect(this.entities).toStrictEqual(scene.entities)
      }
    }
    entity.components.add(TestComponent)
  })

  it('should react to scene events', () => {
    const scene = createMockScene()
    const entity = scene.entities.create()
    const fn = jest.fn()
    class TestComponent extends Component {
      constructor() {
        super()
        fn()
      }
      create(): void {
        fn()
      }
      update(): void {
        fn()
      }
      destroy(): void {
        fn()
      }
    }
    entity.components.add(TestComponent)
    expect(fn).toHaveBeenCalledTimes(1)
    scene.sys.events.emit('update', 0, 0)
    expect(fn).toHaveBeenCalledTimes(3)
    scene.sys.events.emit('destroy')
    expect(fn).toHaveBeenCalledTimes(4)
  })

  it('should have an accessible entity in constructor', () => {
    const scene = createMockScene()
    const entity = scene.entities.create()
    class TestComponent extends Component {
      constructor() {
        super()
        expect(this.entity).toBeDefined()
        expect(this.entity).toStrictEqual(entity)
      }
    }
    entity.components.add(TestComponent)
  })

  it('should throw if a component is required but not found', () => {
    const scene = createMockScene()
    const entity = scene.entities.create()
    class TransformComponent extends Component {}
    class TestComponent extends Component {
      required = [TransformComponent]
    }
    entity.components.add(TestComponent)
    expect(() => scene.sys.events.emit('update', 0, 0)).toThrow()
  })
})
