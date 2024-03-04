# MeBus

MeBus is a type safe, runtime validated, event bus. It is a wrapper around native browser event system, and it uses `io-ts`. 

## Use cases

- Micro frontends communication

  Microfrontends are, by design, disconnected from each other. They are independent applications that are composed together to form a single user interface. This means that they need a way to communicate with each other. MeBus can be used to create a type safe a communication layer between microfrontends.
  Microfronteds only need to share same event schema.

- Event driven architecture

  MeBus can be used to create an event driven architecture. It can be used to create a communication layer between different parts of an application.

## Installation

You can install MeBus using npm:

```bash
npm i mebus
```

## Usage

```javascript
import { MeBus } from 'mebus';
import * as t from 'io-ts'

const myEventSchema = {
  event1: t.type({
    data: t.string
  }),
  event2: t.type({
    id: t.number
  }),
  ["namespace::event3"]: t.type({
    foo: t.boolean
  }),
}


const bus = new MeBus(MyEventSchema);

bus.subscribe("event1", ({ data }) => {
  console.log("event1 received", data);
});

bus.publish("event2", { id: "Hello, world!" });
```

## API

* `constructor(eventSchema: Record<string, TypeC)`
  Creates a new instance of MeBus.

    - `eventSchema`: An object that defines the schema for the events. The keys are the event names and the values are the io-ts schemas for the event payloads.

* `subscribe(eventName: string, handler: (payload: any) => void): void`

  Subscribes to an event. The `handler` function will be called whenever the event is published.

    - `eventName`: The name of the event to subscribe to.

    - `handler`: The function to call when the event is published. The function will be called with the payload of the event.

* `unsubscribe(eventName: string, handler: (payload: any) => void): void`

  Unsubscribes from an event.

    - `eventName`: The name of the event to unsubscribe from.

    - `handler`: The function to unsubscribe.

* `publish(eventName: string, payload: any): void`

    Publishes an event with window.dispatchEvent

    - `eventName`: The name of the event to publish.

    - `payload`: The payload of the event.

## License

MIT



