import { EventSchema, MeBus } from '.';
import * as t from 'io-ts'
import { isLeft } from 'fp-ts/Either';

const myEventSchema: EventSchema = {
  event1: t.type({
    data: t.string
  }),
  event2: t.type({
    id: t.number
  }),
  asd: t.type({
    bar: t.type({
      foo: t.boolean
    })
  }),
  ["namespace::event3"]: t.type({
    foo: t.boolean
  }),
}

const asn: t.Any = t.type({
  foo: t.boolean
})

asn.decode({ foo: true })

isLeft(asn.decode({ foo: "true" }))

const bus = new MeBus(myEventSchema)

bus.subscribe("event1", (payload) => console.log(payload));

bus.publish("event2", { id: 1 });

bus.publish("namespace::event3", { foo: true });