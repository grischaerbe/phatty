import * as Phaser from 'phaser'
import { createAndUpdate } from './Component'
import { Entity } from './Entity'
import { QueryBuilder } from './Query'
import type { Scene } from './Scene'

export class EntitySystem {
  private entities: Entity[] = []
  /**
   * Events emitted by the entity system.
   * Events:
   * - `'create'`: when an entity is created
   *   - `on('create', (entity: Entity) => {})`
   * - `'destroy'`: when an entity is destroyed
   *   - `on('destroy', (entity: Entity) => {})`
   */
  public readonly events = new Phaser.Events.EventEmitter()

  constructor(readonly scene: Scene) {
    this.registerListeners()
  }

  private registerListeners() {
    this.scene.sys.events.on('update', this.sceneUpdate, this)
    this.scene.sys.events.on('sleep', this.sceneSleep, this)
    this.scene.sys.events.on('wake', this.sceneWake, this)
    this.scene.sys.events.on('pause', this.scenePause, this)
    this.scene.sys.events.on('resume', this.sceneResume, this)
    this.scene.sys.events.on('destroy', this.sceneDestroy, this)
    this.scene.sys.events.on('shutdown', this.sceneDestroy, this)
  }

  /**
   * Create an entity.
   *
   * @example
   * ```ts
   * const entity = scene.entities.create()
   * ```
   */
  public create() {
    const entity = new Entity(this.scene)
    this.entities.push(entity)
    this.events.emit('create', entity)
    return entity
  }

  /**
   * Destroy an entity. Will invoke `destroy` on all attached components, remove
   * the entity from the entity system and emit a `destroy` event.
   *
   * @example
   * ```ts
   * const entity = scene.entities.create()
   * scene.entities.destroy(entity)
   * ```
   */
  public destroy(entity: Entity) {
    const index = this.entities.indexOf(entity)
    if (index !== -1) {
      entity.components.forEach((c) => c.destroy())
      entity.components.clear()
      entity.components.events.removeAllListeners()
      this.entities.splice(index, 1)
      this.events.emit('destroy', { entity })
    }
  }

  /**
   * Start building a query for entities
   *
   * @example
   * ```ts
   * // Find entities with specific components
   * scene.entities.query()
   *   .with(Movement, Sprite)
   *   .without(Invisible)
   *   .all()
   *
   * // Complex queries with AND/OR conditions
   * scene.entities.query()
   *   .with(Player)
   *   .and()
   *   .with(Health, Shield)
   *   .or()
   *   .with(Invincible)
   *   .all()
   *
   * // Check if any matching entity exists
   * const hasActivePlayers = scene.entities.query()
   *   .with(Player, Active)
   *   .exists()
   *
   * // Count matching entities
   * const enemyCount = scene.entities.query()
   *   .with(Enemy)
   *   .without(Dead)
   *   .count()
   * ```
   */
  public get query(): QueryBuilder {
    return new QueryBuilder(this.entities)
  }

  private sceneUpdate(time: number, delta: number): void {
    this.entities.forEach((e) => {
      e.components.forEach((c) => {
        c[createAndUpdate](time, delta)
      })
    })
  }

  private sceneSleep(): void {
    this.entities.forEach((e) => {
      e.components.forEach((c) => {
        c.sleep()
      })
    })
  }

  private sceneWake(): void {
    this.entities.forEach((e) => {
      e.components.forEach((c) => {
        c.wake()
      })
    })
  }

  private scenePause(): void {
    this.entities.forEach((e) => {
      e.components.forEach((c) => {
        c.pause()
      })
    })
  }

  private sceneResume(): void {
    this.entities.forEach((e) => {
      e.components.forEach((c) => {
        c.resume()
      })
    })
  }

  private sceneDestroy(): void {
    this.entities.forEach((e) => {
      this.destroy(e)
    })
    this.entities = []
  }
}
