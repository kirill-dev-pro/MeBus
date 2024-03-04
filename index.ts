/**
 * @module
 * MeBus is a type safe and end-to-end runtime validated message bus for the browser.
 */

import type { Any, TypeOf } from 'io-ts'
import { isLeft } from 'fp-ts/Either';

/**
 * EventSchema is a record of event types and their corresponding payload schemas.
 * @example
 * const MyEventSchema: EventSchema = {
 *   event1: t.type({  payload: t.string }),
 *   event2: t.type({  id: t.number }),
 * };
 */
export type EventSchema = Record<string, Any>;

/**
 * Type guard for CustomEvent.
 * @param event - The event to check.
 * @returns true if the event is a CustomEvent, false otherwise.
 */
const isCustomEvent = (event: Event): event is CustomEvent => {
  return event instanceof CustomEvent;
};

/**
 * MeBus is a typed and end-to-end runtime validated message bus for the browser.
 * @param {EventSchema} eventSchema - Schema with definitions for all the event types and their payloads.
 *
 * @example
 * import * as t from "io-ts";
 *
 * const MyEventSchema = {
 *   event1: t.type({  payload: t.string }),
 *   event2: t.type({  id: t.number }),
 * };
 *
 * const bus = new MessageBus(MyEventSchema);
 *
 * bus.subscribe("event1", (payload) => console.log(payload));
 * bus.publish("event2", { id: 1 });
 */
export class MeBus<T extends EventSchema> {
  private eventSchema: T;

  /**
   * Creates a new instance of MeBus.
   * @param eventSchema - Schema with definitions for all the event types and their payloads.
   * @throws Error if MeBus is not used in the browser.
   */
  constructor(eventSchema: T) {
    if (typeof window === "undefined") {
      throw new Error("[MeBus] MeBus is only available in the browser");
    }
    this.eventSchema = eventSchema;
  }

  /**
   * Subscribes to a specific event type and registers a listener function to be called when the event is triggered. Returns cleanup.
   * @param type - The event type to subscribe to.
   * @param listener - The listener function to be called when the event is triggered. It receives the payload of the event as a parameter.
   * @returns A function that can be called to unsubscribe from the event.
   */
  public subscribe<K extends keyof T & string>(
    type: K,
    listener: (payload: TypeOf<T[K]>) => void
  ): () => void {
    const schema = this.eventSchema[type];
    if (!schema) {
      throw new Error(`[MeBus] No schema found for event: ${type}`);
    }

    const abortController = new AbortController();

    window.addEventListener(
      type,
      (e) => {
        if (!isCustomEvent(e)) return;
        const payload = e.detail;
        const validation = schema.decode(payload);
        if (isLeft(validation)) {
          throw new Error(
            validation.left.map((error) => error.message || '').join("\n")
          );
        }
        listener(validation.right);
      },
      { signal: abortController.signal }
    );

    return () => abortController.abort();
  }

  /**
   * Publishes a message of a specific type with the given payload.
   *
   * @param type - The type of the message.
   * @param payload - The payload of the message.
   * @returns void
   * @throws Error if no schema is found for the event or if the payload fails validation.
   */
  public publish<K extends keyof T & string>(
    type: K,
    payload: TypeOf<T[K]>
  ): void {
    const schema = this.eventSchema[type];
    if (!schema) {
      throw new Error(`[MeBus] No schema found for event: ${type}`);
    }
    const validation = schema.decode(payload);
    if (isLeft(validation)) {
      throw new Error(
        validation.left.map((error) => error.message || '').join("\n")
      );
    }
    window.dispatchEvent(new CustomEvent(type, { detail: payload }));
  }
}

export default MeBus;
