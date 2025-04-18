import type { ComponentConstructor } from './types'
import type { Entity } from './Entity'
import { Component } from 'src/Component'

type Condition = (entity: Entity) => boolean

export class QueryBuilder {
  private conditions: Condition[] = []

  constructor(private readonly entities: Set<Entity>) {}

  private evaluateConditions(entity: Entity): boolean {
    // No conditions means match all
    if (this.conditions.length === 0) {
      return true
    }

    // All conditions must be met (AND logic)
    return this.conditions.every((condition) => condition(entity))
  }

  /**
   * Query for entities that have all of the specified components
   *
   * @example
   * ```ts
   * // Single component
   * query().with(PlayerComponent)
   *
   * // Multiple components
   * query().with([MovementComponent, SpriteComponent])
   *
   * // With a `where` function
   * query().with(MovementComponent, (c) => c.x > 100)
   *
   * // With multiple components and a `where` function
   * query().with(
   *   [MovementComponent, SpriteComponent],
   *   ([movement, sprite]) => movement.x > 100 && sprite.visible
   * )
   * ```
   */
  with<CC extends ComponentConstructor>(
    component: CC,
    where?: (component: InstanceType<CC>) => boolean
  ): this
  with<const ComponentConstructors extends [ComponentConstructor, ...ComponentConstructor[]]>(
    components: ComponentConstructors,
    where?: (components: {
      [K in keyof ComponentConstructors]: InstanceType<ComponentConstructors[K]>
    }) => boolean
  ): this
  with(
    componentOrComponents:
      | ComponentConstructor
      | readonly [ComponentConstructor, ...ComponentConstructor[]],
    where?: (component: any) => boolean
  ): this {
    if (Array.isArray(componentOrComponents)) {
      const ctors = componentOrComponents as ComponentConstructor[]
      if (!where) {
        const condition: Condition = (entity) => {
          return ctors.every((ctor) => entity.components.has(ctor))
        }
        this.conditions.push(condition)
      } else {
        const condition: Condition = (entity) => {
          const instances = ctors.map((ctor) => entity.components.find(ctor))
          if (instances.some((instance) => instance === undefined)) {
            return false
          }
          return where(instances)
        }
        this.conditions.push(condition)
      }
    } else {
      const ctor = componentOrComponents as ComponentConstructor
      if (!where) {
        const condition: Condition = (entity) => {
          return entity.components.has(ctor)
        }
        this.conditions.push(condition)
      } else {
        const condition: Condition = (entity) => {
          const componentInstance = entity.components.find(ctor)
          if (!componentInstance) {
            return false
          }
          return where(componentInstance)
        }
        this.conditions.push(condition)
      }
    }

    return this
  }

  /**
   * Exclude entities that have all of the specified components.
   *
   * If a `where` function is provided, entities are excluded only if they have all specified
   * components and the predicate returns `true` for the component instance(s).
   *
   * Entities that are missing any of the specified components are always included.
   *
   * @example
   * ```ts
   * // Exclude entities that have InvisibleComponent
   * query().without(InvisibleComponent)
   *
   * // Exclude entities that have both DeadComponent and DisabledComponent
   * query().without([DeadComponent, DisabledComponent])
   *
   * // Exclude entities that have HealthComponent with a value of 0 or less
   * query().without(HealthComponent, (c) => c.value <= 0)
   *
   * // Exclude entities that have both FrozenComponent and DisabledComponent,
   * // but only if the condition is met
   * query().without(
   *   [FrozenComponent, DisabledComponent],
   *   ([frozen, disabled]) => frozen.duration > 5 && disabled.permanent
   * )
   * ```
   */
  without<CC extends ComponentConstructor>(
    component: CC,
    where?: (component: InstanceType<CC>) => boolean
  ): this
  without<const ComponentConstructors extends [ComponentConstructor, ...ComponentConstructor[]]>(
    components: ComponentConstructors,
    where?: (components: {
      [K in keyof ComponentConstructors]: InstanceType<ComponentConstructors[K]>
    }) => boolean
  ): this
  without(
    componentOrComponents:
      | ComponentConstructor
      | readonly [ComponentConstructor, ...ComponentConstructor[]],
    where?: (component: any) => boolean
  ): this {
    if (Array.isArray(componentOrComponents)) {
      const ctors = componentOrComponents as ComponentConstructor[]
      if (!where) {
        const condition: Condition = (entity) => {
          return !ctors.every((ctor) => entity.components.has(ctor))
        }
        this.conditions.push(condition)
      } else {
        const condition: Condition = (entity) => {
          const instances = ctors.map((ctor) => entity.components.find(ctor))
          if (instances.some((instance) => instance === undefined)) {
            return true // keep entity if it's missing any required component
          }
          return !where(instances) // exclude if predicate is true
        }
        this.conditions.push(condition)
      }
    } else {
      const ctor = componentOrComponents as ComponentConstructor
      if (!where) {
        const condition: Condition = (entity) => {
          return !entity.components.has(ctor)
        }
        this.conditions.push(condition)
      } else {
        const condition: Condition = (entity) => {
          const instance = entity.components.find(ctor)
          if (!instance) {
            return true // keep entity if component is missing
          }
          return !where(instance) // exclude if predicate is true
        }
        this.conditions.push(condition)
      }
    }

    return this
  }

  /**
   * Get the first entity that matches the query conditions
   *
   * @example
   * ```ts
   * const player = query()
   *   .with(PlayerComponent)
   *   .without(DeadComponent)
   *   .first()
   * ```
   */
  first(): Entity | undefined {
    let result: Entity | undefined
    for (const entity of this.entities) {
      if (this.evaluateConditions(entity)) {
        result = entity
        break
      }
    }
    this.conditions = []
    return result
  }

  /**
   * Get all entities that match the query conditions
   *
   * @example
   * ```ts
   * const enemies = query()
   *   .with(EnemyComponent)
   *   .without(DeadComponent)
   *   .all()
   * ```
   */
  all(): Entity[] {
    const result: Entity[] = []
    for (const entity of this.entities) {
      if (this.evaluateConditions(entity)) {
        result.push(entity)
      }
    }
    this.conditions = []
    return result
  }

  /**
   * Count the number of entities that match the query conditions
   *
   * @example
   * ```ts
   * const activeEnemyCount = query()
   *   .with(EnemyComponent)
   *   .without(DeadComponent)
   *   .count()
   * ```
   */
  count(): number {
    return this.all().length
  }

  /**
   * Check if any entities match the query conditions
   *
   * @example
   * ```ts
   * const hasActivePlayers = query()
   *   .with(PlayerComponent)
   *   .without(DeadComponent)
   *   .exists()
   * ```
   */
  exists(): boolean {
    return this.first() !== undefined
  }
}
