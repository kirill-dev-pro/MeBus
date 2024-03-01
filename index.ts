import z from "zod";

export type EventSchema = Record<string, z.Schema>;

const isCustomEvent = (event: Event): event is CustomEvent => {
  return event instanceof CustomEvent;
};

/**
 * MeBus is a typed and end-to-end runtime validated message bus for the browser.
 * @param {EventSchema} eventSchema - Schema with definitions for all the event types and their payloads.
 *
 * @example
 * import z from "zod";
 *
 * const MyEventSchema = {
 *  event1: z.object({  payload: z.string(), }),
 *  event2: z.object({  id: z.number(), }),
 * };
 *
 * const bus = new MessageBus(MyEventSchema);
 *
 * bus.subscribe("event1", (payload) => console.log(payload));
 * bus.publish("event2", { id: 1 });
 */
export class MeBus<T extends EventSchema> {
  private eventSchema: T;

  constructor(eventSchema: T) {
    if (typeof window === "undefined") {
      throw new Error("[MeBus] MeBus is only available in the browser");
    }
    this.eventSchema = eventSchema;
  }

  /**
   * Subscribes to a specific event type and registers a listener function to be called when the event is triggered.
   * @param type - The event type to subscribe to.
   * @param listener - The listener function to be called when the event is triggered. It receives the payload of the event as a parameter.
   * @returns A function that can be called to unsubscribe from the event.
   */
  public subscribe<K extends keyof T & string>(type: K, listener: (payload: z.infer<T[K]>) => void) {
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
        const validation = schema.safeParse(payload);
        if (!validation.success) {
          throw new Error(
            validation.error.errors.map((e) => e.message).join("\n")
          );
        }
        listener(validation.data);
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
  public publish<K extends keyof T & string>(type: K, payload: z.infer<T[K]>): void {
    const schema = this.eventSchema[type];
    if (!schema) {
      throw new Error(`[MeBus] No schema found for event: ${type}`);
    }
    const validation = schema.safeParse(payload);
    if (!validation.success) {
      throw new Error(validation.error.errors.map((e) => e.message).join("\n"));
    }
    window.dispatchEvent(new CustomEvent(type, { detail: payload }));
  }
}

export default MeBus;
