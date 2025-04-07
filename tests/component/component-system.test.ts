import { describe, expect, it } from 'bun:test'
import { Component } from '../../src/Component'
import { createMockScene } from '../scene'

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
