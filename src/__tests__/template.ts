// import * as index from "../index";

function nop(): boolean {
  return true;
}

describe("tests", () => {
  beforeAll(() => {
    nop();
  });

  afterAll(() => {
    nop();
  });

  beforeEach(() => {
    nop();
  });

  afterEach(() => {
    nop();
  });

  test("test something", () => {
    expect("value").toBe("value");
    expect([1, 2, 3]).toEqual([1, 2, 3]);
  });

});
