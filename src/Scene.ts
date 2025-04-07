import * as Phaser from 'phaser'
import { EntitySystem } from './EntitySystem'

export class Scene extends Phaser.Scene {
  entities: EntitySystem
  constructor(...config: ConstructorParameters<typeof Phaser.Scene>) {
    super(...config)
    this.entities = new EntitySystem(this)
  }
}
