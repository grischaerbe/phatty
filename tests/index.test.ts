import { describe, expect, it, jest } from 'bun:test'
import { Component } from '../src/Component'
import { Entity } from '../src/Entity'
import { createMockScene } from './scene.test'
import { component } from '../src/utils/componentDecorator'
import { createEventEmitter, MockEventEmitter } from './emtter.test'

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
    class TestComponent extends Component {
      constructor(public num: number) {
        super()
      }
    }
    entity.components.add(TestComponent, 2)
    expect(entity).toBeDefined()
  })

  it('should react to scene events', () => {
    const scene = createMockScene()
    const entity = new Entity(scene)
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
    const entity = new Entity(scene)
    class TestComponent extends Component {
      constructor() {
        super()
        expect(this.entity).toBeDefined()
        expect(this.entity).toStrictEqual(entity)
      }
    }
    entity.components.add(TestComponent)
  })

  it('should listen to events', () => {
    const scene = createMockScene()
    const entity = new Entity(scene)
    const fn = jest.fn()
    class TestComponent extends Component {
      constructor() {
        super()
        this.listen(this.entity.scene.sys.events, 'event', (arg0: number) => {
          fn(arg0)
        })
      }
    }
    entity.components.add(TestComponent)
    scene.sys.events.emit('event', 1)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith(1)
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

  it('should throw if component is not found with get', () => {
    const scene = createMockScene()
    const entity = new Entity(scene)
    class TestComponent extends Component {}
    expect(() => entity.components.get(TestComponent)).toThrow()
  })

  it('should add and remove components', () => {
    const scene = createMockScene()
    const entity = new Entity(scene)
    class TestComponent extends Component {}
    entity.components.add(TestComponent)
    entity.components.remove(TestComponent)
    expect(() => entity.components.get(TestComponent)).toThrow()
  })

  it('should respect the component priority', () => {
    const scene = createMockScene()
    const entity = new Entity(scene)
    let i = 0
    @component({
      priority: 1
    })
    class ComponentB extends Component {
      public update(time: number, delta: number): void {
        expect(i).toEqual(1)
        i++
      }
    }
    @component({
      priority: -1
    })
    class ComponentA extends Component {
      public update(time: number, delta: number): void {
        expect(i).toEqual(0)
        i++
      }
    }
    entity.components.add(ComponentB)
    entity.components.add(ComponentA)
    scene.sys.events.emit('update', 0, 0)
  })

  it('to return undefined when no component is found with find', () => {
    const scene = createMockScene()
    const entity = new Entity(scene)
    class TestComponent extends Component {}
    const instance = entity.components.find(TestComponent)
    expect(instance).toBeUndefined()
  })

  it('should check the presence of components', () => {
    const scene = createMockScene()
    const entity = new Entity(scene)
    class TestComponent extends Component {}
    entity.components.add(TestComponent)
    expect(entity.components.has(TestComponent)).toBeTrue()
    class OtherTestComponent extends Component {}
    expect(entity.components.has(OtherTestComponent)).toBeFalse()
  })

  it('should return all components', () => {
    const scene = createMockScene()
    const entity = new Entity(scene)
    class TestComponent extends Component {}
    class OtherTestComponent extends Component {}
    entity.components.add(TestComponent)
    entity.components.add(OtherTestComponent)
    const all = entity.components.all()
    expect(all).toHaveLength(2)
  })

  it('should clear all components', () => {
    const scene = createMockScene()
    const entity = new Entity(scene)
    class TestComponent extends Component {}
    class OtherTestComponent extends Component {}
    entity.components.add(TestComponent)
    entity.components.add(OtherTestComponent)
    expect(entity.components.all()).toHaveLength(2)
    entity.components.clear()
    expect(entity.components.all()).toHaveLength(0)
  })
})
