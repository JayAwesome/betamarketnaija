import { test } from "node:test";
import { strict as assert } from "node:assert";
import { deliverDemoEvent } from "./phone-demo";
const event = { id: 1, crop: "Rice" as const, city: "Kano" as const, message: "Sample" };
test("demo alerts are blocked while paused", () => assert.equal(deliverDemoEvent(false, "Rice", "Kano", event, []).length, 0));
test("only matching crop and city receive demo alerts", () => {
  assert.equal(deliverDemoEvent(true, "Maize", "Kano", event, []).length, 0);
  assert.equal(deliverDemoEvent(true, "Rice", "Lagos", event, []).length, 0);
  assert.deepEqual(deliverDemoEvent(true, "Rice", "Kano", event, []), [event]);
});
test("a demo event is delivered once", () => assert.equal(deliverDemoEvent(true, "Rice", "Kano", event, [event]).length, 1));