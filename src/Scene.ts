import * as Phaser from 'phaser'
import { EntitySystem } from './EntitySystem'

export class Scene extends Phaser.Scene {
  entities: EntitySystem

  constructor(...config: ConstructorParameters<typeof Phaser.Scene>) {
    super(...config)

    this.entities = new EntitySystem(this)

    // catch calls to init and call entities.setup() as we need to wait for the
    // scene to be fully initialized in order to register listeners
    const self = this as unknown as { init?: (...args: any[]) => void }
    const ogInit = self.init
    self.init = (...args: any[]) => {
      this.entities.setup()
      ogInit?.(...args)
    }
  }

  /**
   * Initializes the entity system. When extending this class, make sure to call
   * `super.create()` in your `create` method to ensure the entity system is properly initialized.
   *
   * @example
   * ```ts
   * class GameScene extends Scene {
   *   create() {
   *     super.create() // Don't forget this!
   *     // Your game initialization code here
   *   }
   * }
   * ```
   */
  create() {
    this.entities = new EntitySystem(this)
  }
}
