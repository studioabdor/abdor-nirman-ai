import { cn } from "@/lib/utils"; // Assuming your tsconfig paths are set up for Jest

describe("cn utility", () => {
  test("should combine basic strings", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  test("should handle conditional classes correctly", () => {
    expect(cn("foo", true && "bar", false && "baz")).toBe("foo bar");
    expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
  });

  test("should handle mixed arguments (strings, objects, conditionals)", () => {
    expect(cn("p-4", "font-bold", { "bg-blue-500": true, "text-white": false }, true && "rounded-md"))
      .toBe("p-4 font-bold bg-blue-500 rounded-md");
  });

  test("should ignore falsy values like null, undefined, false", () => {
    expect(cn("foo", null, "bar", undefined, false, "baz")).toBe("foo bar baz");
  });

  test("should handle arrays of class names", () => {
    expect(cn(["foo", "bar"], ["baz", { qux: true }])).toBe("foo bar baz qux");
  });

  test("should return an empty string if no arguments are provided", () => {
    expect(cn()).toBe("");
  });

  test("should return an empty string if only falsy values are provided", () => {
    expect(cn(null, undefined, false)).toBe("");
  });
});
