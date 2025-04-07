import { describe, expect, it, jest } from 'bun:test'
import { Component } from '../../src/Component'
import { createMockScene } from '../scene.test'

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
