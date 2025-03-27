import { Entity } from '../Entity'

/**
 * Augments a MatterJS body with an entity reference.
 *
 * @param body A MatterJS body.
 * @param entity An entity.
 */
export const augmentBody = (body: MatterJS.BodyType, entity: Entity) => {
  ;(body as any).entity = entity
}

/**
 * Retrieves an entity from a MatterJS body.
 *
 * @param body A MatterJS body.
 * @returns An entity or undefined if the body is not augmented.
 */
export const getEntity = (body: MatterJS.BodyType): Entity | undefined => {
  if ('entity' in body) {
    return (body as any).entity as Entity
  }
  return undefined
}
