import { Db } from "#db/db";

const db = new Db();

const SEED_DATA = [
  { name: "Animals", size: 100 },
  { name: "Animals > Birds", size: 20 },
  { name: "Animals > Birds > Parrot", size: 5 },
  { name: "Animals > Birds > Eagle", size: 8 },
  { name: "Animals > Cats", size: 30 },
  { name: "Animals > Dogs", size: 50 },
  { name: "Animals > Dogs > Labrador", size: 25 },
  { name: "Animals > Dogs > Poodle", size: 15 },
];

beforeAll(async () => {
  await db.init();
});

afterAll(async () => {
  await db.close();
});

beforeEach(async () => {
  await db.clear();
  await db.seed(SEED_DATA);
});

describe("getItems", () => {
  describe("basic pagination", () => {
    it("returns items for the first page", async () => {
      const { items, total } = await db.getItems(1, 2, "Animals", "name", "asc", "", false);

      expect(items).toMatchObject([{ name: "Animals > Birds" }, { name: "Animals > Cats" }]);
      expect(total).toBe(3);
    });

    it("returns items for the second page", async () => {
      const { items, total } = await db.getItems(2, 2, "Animals", "name", "asc", "", false);

      expect(items).toMatchObject([{ name: "Animals > Dogs" }]);
      expect(total).toBe(3);
    });

    it("returns empty when page exceeds total", async () => {
      const { items, total } = await db.getItems(99, 10, "Animals", "name", "asc", "", false);

      expect(items).toEqual([]);
      expect(total).toBe(3);
    });
  });

  describe("parent filtering", () => {
    it("returns only direct children of the given parent", async () => {
      const { items } = await db.getItems(1, 10, "Animals", "name", "asc", "", false);
      const names = items.map((i) => i.name);

      expect(names).toEqual(["Animals > Birds", "Animals > Cats", "Animals > Dogs"]);
    });

    it("falls back to the first top-level item when parent is empty", async () => {
      const { items } = await db.getItems(1, 10, "", "name", "asc", "", false);

      // first item alphabetically is "Animals", so direct children of "Animals" are returned
      expect(items).toMatchObject([
        { name: "Animals > Birds" },
        { name: "Animals > Cats" },
        { name: "Animals > Dogs" },
      ]);
    });

    it("returns children of a nested parent", async () => {
      const { items, total } = await db.getItems(1, 10, "Animals > Dogs", "name", "asc", "", false);
      const names = items.map((i) => i.name);

      expect(names).toEqual(["Animals > Dogs > Labrador", "Animals > Dogs > Poodle"]);
      expect(total).toBe(2);
    });

    it("returns empty when parent has no children", async () => {
      const { items, total } = await db.getItems(1, 10, "Animals > Cats", "name", "asc", "", false);

      expect(items).toEqual([]);
      expect(total).toBe(0);
    });
  });

  describe("subfolders", () => {
    it("returns all descendants when subfolders is true", async () => {
      const { items, total } = await db.getItems(1, 10, "Animals", "name", "asc", "", true);

      expect(total).toBe(7);
      expect(items).toMatchObject([
        { name: "Animals > Birds" },
        { name: "Animals > Birds > Eagle" },
        { name: "Animals > Birds > Parrot" },
        { name: "Animals > Cats" },
        { name: "Animals > Dogs" },
        { name: "Animals > Dogs > Labrador" },
        { name: "Animals > Dogs > Poodle" },
      ]);
    });

    it("includes subPath for items in nested folders", async () => {
      const { items } = await db.getItems(1, 10, "Animals", "name", "asc", "", true);
      const labrador = items.find((i) => i.name === "Animals > Dogs > Labrador");

      expect(labrador?.subPath).toBe("Dogs");
    });

    it("does not include subPath for direct children", async () => {
      const { items } = await db.getItems(1, 10, "Animals", "name", "asc", "", false);

      expect(items.map((i) => i.subPath)).toEqual([undefined, undefined, undefined]);
    });

    it("subPath for direct children when subfolders is true falls back to the full name", async () => {
      // The regexp only captures an intermediate path segment when there are 2+ levels below
      // the parent. For direct children (one level below), it does not match, so PostgreSQL
      // returns the original name unchanged.
      const { items } = await db.getItems(1, 10, "Animals", "name", "asc", "", true);
      const birds = items.find((i) => i.name === "Animals > Birds");

      expect(birds?.subPath).toBe("Animals > Birds");
    });

    it("paginates correctly when subfolders is true", async () => {
      // 7 descendants of "Animals" total; page 2 with pageSize 4 should return 3 items
      const { items, total } = await db.getItems(2, 4, "Animals", "name", "asc", "", true);

      expect(total).toBe(7);
      expect(items).toMatchObject([
        { name: "Animals > Dogs" },
        { name: "Animals > Dogs > Labrador" },
        { name: "Animals > Dogs > Poodle" },
      ]);
    });
  });

  describe("search", () => {
    it("filters results by search term", async () => {
      const { items, total } = await db.getItems(1, 10, "Animals", "name", "asc", "oo", true);
      const names = items.map((i) => i.name);

      expect(total).toBe(1);
      expect(names).toEqual(["Animals > Dogs > Poodle"]);
    });

    it("returns empty when search matches nothing", async () => {
      const { items, total } = await db.getItems(1, 10, "Animals", "name", "asc", "xyz", false);

      expect(items).toEqual([]);
      expect(total).toBe(0);
    });

    it("search is scoped to direct children when subfolders is false", async () => {
      // "Dog" matches "Animals > Dogs" directly but not deeper items
      const { items } = await db.getItems(1, 10, "Animals", "name", "asc", "Dog", false);
      const names = items.map((i) => i.name);

      expect(names).toEqual(["Animals > Dogs"]);
    });

    it("search is case-sensitive", async () => {
      const { total: matchUpper } = await db.getItems(
        1,
        10,
        "Animals",
        "name",
        "asc",
        "Poodle",
        true,
      );
      const { total: matchLower } = await db.getItems(
        1,
        10,
        "Animals",
        "name",
        "asc",
        "poodle",
        true,
      );

      expect(matchUpper).toBe(1);
      expect(matchLower).toBe(0);
    });

    it("regex metacharacter '.' in search matches any character", async () => {
      // "." is a valid regex that matches any single character, so it matches all direct children
      const { total } = await db.getItems(1, 10, "Animals", "name", "asc", ".", false);

      expect(total).toBe(3);
    });

    it("invalid regex in search throws", async () => {
      // An unmatched "(" is an invalid regex and causes a database error
      await expect(db.getItems(1, 10, "Animals", "name", "asc", "(oo", false)).rejects.toThrow();
    });
  });

  describe("sorting", () => {
    it("sorts by name ascending", async () => {
      const { items } = await db.getItems(1, 10, "Animals", "name", "asc", "", false);
      const names = items.map((i) => i.name);

      expect(names).toEqual(["Animals > Birds", "Animals > Cats", "Animals > Dogs"]);
    });

    it("sorts by name descending", async () => {
      const { items } = await db.getItems(1, 10, "Animals", "name", "desc", "", false);
      const names = items.map((i) => i.name);

      expect(names).toEqual(["Animals > Dogs", "Animals > Cats", "Animals > Birds"]);
    });

    it("sorts by size ascending", async () => {
      const { items } = await db.getItems(1, 10, "Animals", "size", "asc", "", false);
      const names = items.map((i) => i.name);

      expect(names).toEqual(["Animals > Birds", "Animals > Cats", "Animals > Dogs"]);
    });

    it("sorts by size descending", async () => {
      const { items } = await db.getItems(1, 10, "Animals", "size", "desc", "", false);
      const names = items.map((i) => i.name);

      expect(names).toEqual(["Animals > Dogs", "Animals > Cats", "Animals > Birds"]);
    });

    it("sorts by subPath ascending", async () => {
      // Direct children have subPath = full name (regex unmatched), nested items have the
      // intermediate folder name. LOWER("Animals > Birds") < LOWER("birds") so direct children
      // sort before nested ones when ascending.
      const { items } = await db.getItems(1, 10, "Animals", "subPath", "asc", "", true);

      expect(items.map((i) => i.subPath)).toEqual([
        "Animals > Birds",
        "Animals > Cats",
        "Animals > Dogs",
        "Birds",
        "Birds",
        "Dogs",
        "Dogs",
      ]);
    });

    it("sorts by subPath descending", async () => {
      const { items } = await db.getItems(1, 10, "Animals", "subPath", "desc", "", true);

      expect(items.map((i) => i.subPath)).toEqual([
        "Dogs",
        "Dogs",
        "Birds",
        "Birds",
        "Animals > Dogs",
        "Animals > Cats",
        "Animals > Birds",
      ]);
    });
  });

  describe("non-existent parent", () => {
    it("returns empty items and zero total when parent does not exist", async () => {
      const { items, total } = await db.getItems(1, 10, "Nonexistent", "name", "asc", "", false);

      expect(items).toEqual([]);
      expect(total).toBe(0);
    });
  });
});
