import { Scene } from '../../src/Scene'
import { Entity } from '../../src/Entity'
import { Component } from '../../src/Component'
import { QueryBuilder } from '../../src/QueryBuilder'
import { describe, expect, it, beforeEach } from 'bun:test'
import { createMockScene } from '../scene'

class ParametricComponent extends Component {
  constructor(public readonly param: string) {
    super()
  }
}

// Test components
class TestComponentA extends Component {}
class TestComponentB extends Component {}
class TestComponentC extends Component {}
class TestComponentD extends Component {}
class TestComponentE extends Component {}

describe('QueryBuilder', () => {
  let scene: Scene
  let entities: Entity[]
  let query: QueryBuilder

  beforeEach(() => {
    scene = createMockScene()

    entities = [
      scene.entities.create(), // Entity 0: No components
      scene.entities.create(), // Entity 1: A
      scene.entities.create(), // Entity 2: A, B
      scene.entities.create(), // Entity 3: A, B, C
      scene.entities.create(), // Entity 4: A, C
      scene.entities.create(), // Entity 5: B, C
      scene.entities.create(), // Entity 6: A, B, C, D

      scene.entities.create(), // Entity 7: Parametric with param 'foo'
      scene.entities.create(), // Entity 8: Parametric with param 'bar'
      scene.entities.create() // Entity 9: A, Parametric with param 'bar'
    ]

    // Add components to entities
    entities[1].components.add(TestComponentA)

    entities[2].components.add(TestComponentA)
    entities[2].components.add(TestComponentB)

    entities[3].components.add(TestComponentA)
    entities[3].components.add(TestComponentB)
    entities[3].components.add(TestComponentC)

    entities[4].components.add(TestComponentA)
    entities[4].components.add(TestComponentC)

    entities[5].components.add(TestComponentB)
    entities[5].components.add(TestComponentC)

    entities[6].components.add(TestComponentA)
    entities[6].components.add(TestComponentB)
    entities[6].components.add(TestComponentC)
    entities[6].components.add(TestComponentD)

    entities[7].components.add(ParametricComponent, 'foo')

    entities[8].components.add(ParametricComponent, 'bar')

    entities[9].components.add(TestComponentA)
    entities[9].components.add(ParametricComponent, 'baz')

    query = scene.entities.query
  })

  describe('with()', () => {
    it('should return all entities', () => {
      const result = query.all()
      expect(result).toHaveLength(10)
    })

    it('should find entities with a single component', () => {
      const result = query.with(TestComponentA).all()

      expect(result).toHaveLength(6)
      expect(result).toContain(entities[1])
      expect(result).toContain(entities[2])
      expect(result).toContain(entities[3])
      expect(result).toContain(entities[4])
      expect(result).toContain(entities[6])
      expect(result).toContain(entities[9])
    })

    it('should find entities with multiple components', () => {
      const result = query.with([TestComponentA, TestComponentB]).all()
      expect(result).toHaveLength(3)
      expect(result).toContain(entities[2])
      expect(result).toContain(entities[3])
      expect(result).toContain(entities[6])
    })

    it('should find entities with a component and a where function', () => {
      const result = query.with(ParametricComponent, (c) => c.param === 'foo').all()
      expect(result).toHaveLength(1)
      expect(result).toContain(entities[7])
    })

    it('should find entities with multiple components and a where function', () => {
      const result = query
        .with([ParametricComponent, TestComponentA], ([c1, c2]) => c1.param === 'foo')
        .all()
      expect(result).toHaveLength(0)
    })
  })

  describe('without()', () => {
    it('should find entities without a single component', () => {
      const result = query.without(TestComponentA).all()
      expect(result).toHaveLength(4)
      expect(result).toContain(entities[0])
      expect(result).toContain(entities[5])
    })

    it('should find entities without multiple components', () => {
      const result = query.without([TestComponentA, TestComponentB]).all()
      expect(result).toHaveLength(3)
      expect(result).toContain(entities[0])
    })

    it('should find entities without a component and a where function', () => {
      const result = query.without(ParametricComponent, (c) => c.param === 'foo').all()
      expect(result).toContain(entities[8])
    })

    it('should find entities without multiple components and a where function', () => {
      const result = query
        .without([ParametricComponent, TestComponentA], ([c1, _c2]) => {
          return c1.param === 'baz'
        })
        .all()
      expect(result).toHaveLength(9)
    })
  })

  describe('first()', () => {
    it('should return the first matching entity', () => {
      const result = query.with(TestComponentA).first()
      expect(result).toBe(entities[1])
    })

    it('should return undefined if no entity matches', () => {
      const result = query.with(TestComponentE).first()
      expect(result).toBeUndefined()
    })
  })

  describe('count()', () => {
    it('should return the number of matching entities', () => {
      const result = query.with(TestComponentA).count()
      expect(result).toBe(6)
    })

    it('should return 0 if no entity matches', () => {
      const result = query.with(TestComponentE).count()
      expect(result).toBe(0)
    })
  })

  describe('exists()', () => {
    it('should return true if at least one entity matches', () => {
      const result = query.with(TestComponentA).exists()
      expect(result).toBe(true)
    })

    it('should return false if no entity matches', () => {
      const result = query.with(TestComponentE).exists()
      expect(result).toBe(false)
    })
  })

  describe('complex queries', () => {
    it('should handle multiple conditions', () => {
      const result = query.with([TestComponentA, TestComponentB]).without(TestComponentD).all()
      expect(result).toHaveLength(2)
      expect(result).toContain(entities[2])
      expect(result).toContain(entities[3])
    })
  })
})
