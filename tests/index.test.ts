import { describe, expect, it, jest } from 'bun:test'
import { Component } from '../src/Component'
import { createMockScene } from './scene.test'

describe('Entity', () => {
  it('should create an entity', () => {
    const scene = createMockScene()
    const entity = scene.entities.create()
    expect(entity).toBeDefined()
  })
})

describe('EntitySystem', () => {
  it('resets after scene destroy', () => {
    const scene = createMockScene()
    const entity = scene.entities.create()
    class TestComponent extends Component {}
    entity.components.add(TestComponent)
    expect(scene.entities.query.with(TestComponent).all()).toHaveLength(1)
    scene.sys.events.emit('destroy')
    expect(scene.entities.query.with(TestComponent).all()).toHaveLength(0)
  })

  it('respects a scene lifecycle', () => {
    const scene = createMockScene()
    const entity = scene.entities.create()
    const fn = jest.fn()
    let i = 0
    class TestComponent extends Component {
      constructor() {
        super()
      }
      public create(): void {
        i++
        fn(i)
        expect(i).toEqual(1)
      }
      public update(time: number, delta: number): void {
        i++
        fn(i)
        if (i === 2) {
          expect(time).toEqual(10)
          expect(delta).toEqual(10)
        } else if (i === 3) {
          expect(time).toEqual(20)
          expect(delta).toEqual(10)
        } else {
          throw new Error('Unexpected call')
        }
      }
      public sleep(): void {
        i++
        fn(i)
        expect(i).toEqual(4)
      }
      public wake(): void {
        i++
        fn(i)
        expect(i).toEqual(5)
      }
      public pause(): void {
        i++
        fn(i)
        expect(i).toEqual(6)
      }
      public resume(): void {
        i++
        fn(i)
        expect(i).toEqual(7)
      }
    }
    entity.components.add(TestComponent)
    scene.sys.events.emit('update', 10, 10)
    scene.sys.events.emit('update', 20, 10)
    scene.sys.events.emit('sleep')
    scene.sys.events.emit('wake')
    scene.sys.events.emit('pause')
    scene.sys.events.emit('resume')
    scene.sys.events.emit('destroy')
    expect(fn).toHaveBeenCalledTimes(7)
  })

  it('should destroy all entities when the scene is destroyed', () => {
    const scene = createMockScene()
    const entity = scene.entities.create()
    const fn = jest.fn()
    class TestComponent extends Component {
      public destroy(): void {
        fn()
      }
    }
    entity.components.add(TestComponent)
    expect(scene.entities.query.with(TestComponent).all()).toHaveLength(1)
    scene.sys.events.emit('destroy')
    expect(fn).toHaveBeenCalledTimes(1)
    expect(scene.entities.query.with(TestComponent).all()).toHaveLength(0)
  })

  it('should destroy the entity when manually destroyed', () => {
    const scene = createMockScene()
    const entity = scene.entities.create()
    const fn = jest.fn()
    class TestComponent extends Component {
      public destroy(): void {
        fn()
      }
    }
    entity.components.add(TestComponent)
    expect(scene.entities.query.with(TestComponent).all()).toHaveLength(1)
    entity.destroy()
    expect(fn).toHaveBeenCalledTimes(1)
    expect(scene.entities.query.with(TestComponent).all()).toHaveLength(0)
  })

  it('should find an entity by component', () => {
    const scene = createMockScene()
    const entity = scene.entities.create()
    const fn = jest.fn()
    class TestComponent extends Component {
      public create(): void {
        fn()
      }
    }
    entity.components.add(TestComponent)
    expect(scene.entities.query.with(TestComponent).first()).toStrictEqual(entity)
  })

  it('should listen to scene events in multiple scene iterations', () => {
    const scene = createMockScene()
    const entity = scene.entities.create()
    const updateFn = jest.fn()
    const destroyFn = jest.fn()
    class TestComponent extends Component {
      public create(): void {
        updateFn()
      }

      public destroy(): void {
        destroyFn()
      }
    }
    entity.components.add(TestComponent)
    scene.sys.events.emit('update', 0, 0)
    expect(updateFn).toHaveBeenCalledTimes(1)
    scene.sys.events.emit('destroy')
    expect(destroyFn).toHaveBeenCalledTimes(1)
    expect(scene.entities.query.with(TestComponent).all()).toHaveLength(0)

    // Add a new entity
    const entity2 = scene.entities.create()
    entity2.components.add(TestComponent)
    scene.sys.events.emit('update', 0, 0)
    expect(updateFn).toHaveBeenCalledTimes(2)
    scene.sys.events.emit('destroy')
    expect(destroyFn).toHaveBeenCalledTimes(2)
  })
})

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

describe('ComponentSystem', () => {
  it('should create a component system', () => {
    const scene = createMockScene()
    const entity = scene.entities.create()
    expect(entity.components).toBeDefined()
  })

  it('should find components by type', () => {
    const scene = createMockScene()
    const entity = scene.entities.create()
    class TestComponent extends Component {}
    entity.components.add(TestComponent)
    expect(entity.components.get(TestComponent)).toBeDefined()
  })

  it('should throw if component is not found with get', () => {
    const scene = createMockScene()
    const entity = scene.entities.create()
    class TestComponent extends Component {}
    expect(() => entity.components.get(TestComponent)).toThrow()
  })

  it('should add and remove components', () => {
    const scene = createMockScene()
    const entity = scene.entities.create()
    class TestComponent extends Component {}
    entity.components.add(TestComponent)
    entity.components.remove(TestComponent)
    expect(() => entity.components.get(TestComponent)).toThrow()
  })

  it('should respect the component priority', () => {
    const scene = createMockScene()
    const entity = scene.entities.create()
    let i = 0
    class ComponentB extends Component {
      public priority: number = 1
      public update(time: number, delta: number): void {
        expect(i).toEqual(1)
        i++
      }
    }
    class ComponentA extends Component {
      public priority: number = -1
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
    const entity = scene.entities.create()
    class TestComponent extends Component {}
    const instance = entity.components.find(TestComponent)
    expect(instance).toBeUndefined()
  })

  it('should check the presence of components', () => {
    const scene = createMockScene()
    const entity = scene.entities.create()
    class TestComponent extends Component {}
    entity.components.add(TestComponent)
    expect(entity.components.has(TestComponent)).toBeTrue()
    class OtherTestComponent extends Component {}
    expect(entity.components.has(OtherTestComponent)).toBeFalse()
  })

  it('should return all components', () => {
    const scene = createMockScene()
    const entity = scene.entities.create()
    class TestComponent extends Component {}
    class OtherTestComponent extends Component {}
    entity.components.add(TestComponent)
    entity.components.add(OtherTestComponent)
    const all = entity.components.all()
    expect(all).toHaveLength(2)
  })

  it('should clear all components', () => {
    const scene = createMockScene()
    const entity = scene.entities.create()
    class TestComponent extends Component {}
    class OtherTestComponent extends Component {}
    entity.components.add(TestComponent)
    entity.components.add(OtherTestComponent)
    expect(entity.components.all()).toHaveLength(2)
    entity.components.clear()
    expect(entity.components.all()).toHaveLength(0)
  })
})
