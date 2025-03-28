import { describe, expect, it, jest } from 'bun:test'
import { Component } from '../src/Component'
import { Entity } from '../src/Entity'
import { createMockScene } from './scene'

describe('Entity', () => {
  it('should create an entity', () => {
    const scene = createMockScene()
    const entity = new Entity(scene)
    expect(entity).toBeDefined()
  })
})

describe('Component', () => {
  it('should create a component', () => {
    const scene = createMockScene()
    const entity = new Entity(scene)
    class TestComponent extends Component {}
    entity.components.add(TestComponent)
    expect(entity).toBeDefined()
  })

  it('should react to scene events', () => {
    const scene = createMockScene()
    const entity = new Entity(scene)
    const fn = jest.fn()
    class TestComponent extends Component {
      init() {
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
})

describe('ComponentSystem', () => {
  it('should create a component system', () => {
    const scene = createMockScene()
    const entity = new Entity(scene)
    expect(entity.components).toBeDefined()
  })

  it('should find components by type', () => {
    const scene = createMockScene()
    const entity = new Entity(scene)
    class TestComponent extends Component {}
    entity.components.add(TestComponent)
    expect(entity.components.get(TestComponent)).toBeDefined()
  })

  it('should throw if component is not found', () => {
    const scene = createMockScene()
    const entity = new Entity(scene)
    class TestComponent extends Component {}
    expect(() => entity.components.get(TestComponent)).toThrow()
  })
})
