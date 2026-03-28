import { useGetApi } from "#api/taxonomy";
import { Taxonomy } from "#modules/taxonomy/taxonomy";
import { expect, test, vi, beforeEach } from "vitest";
import { render } from "vitest-browser-react";
import "#style.css";

vi.mock("#api/taxonomy");
const mockedUseGetApi = vi.mocked(useGetApi);

type MockReturn = ReturnType<typeof useGetApi>;

beforeEach(() => {
  mockedUseGetApi.mockReturnValue({
    data: undefined,
    isLoading: false,
  } as unknown as MockReturn);
});

test("renders heading", async () => {
  const { getByRole } = await render(<Taxonomy />);
  await expect.element(getByRole("heading", { name: "Taxonomy" })).toBeInTheDocument();
});

test("shows skeleton when loading", async () => {
  mockedUseGetApi.mockReturnValue({
    data: undefined,
    isLoading: true,
  } as unknown as MockReturn);

  const { getByRole } = await render(<Taxonomy />);
  // item count text is replaced by a skeleton — the paragraph should not be present
  await expect.element(getByRole("heading", { name: "Taxonomy" })).toBeInTheDocument();
  const countText = document.querySelector("[data-testid='item-count']");
  expect(countText).toBeNull();
});

test("shows item count when data is loaded", async () => {
  mockedUseGetApi.mockReturnValue({
    data: { data: { items: [], total: 42, name: "Root", performance: undefined } },
    isLoading: false,
  } as unknown as MockReturn);

  const { getByText } = await render(<Taxonomy />);
  await expect.element(getByText("42 items")).toBeInTheDocument();
});

test("shows empty table message when no items", async () => {
  mockedUseGetApi.mockReturnValue({
    data: { data: { items: [], total: 0, name: "Root", performance: undefined } },
    isLoading: false,
  } as unknown as MockReturn);

  const { getByText } = await render(<Taxonomy />);
  await expect.element(getByText("No taxonomy entries found.")).toBeInTheDocument();
});

test("renders table rows for each item", async () => {
  mockedUseGetApi.mockReturnValue({
    data: {
      data: {
        items: [
          { name: "Animals", fullName: "Animals", size: 1024 },
          { name: "Plants", fullName: "Plants", size: 2048 },
        ],
        total: 2,
        name: "Root",
        performance: undefined,
      },
    },
    isLoading: false,
  } as unknown as MockReturn);

  const { getByText } = await render(<Taxonomy />);
  await expect.element(getByText("Animals")).toBeInTheDocument();
  await expect.element(getByText("Plants")).toBeInTheDocument();
});

test("shows search input", async () => {
  const { getByRole } = await render(<Taxonomy />);
  await expect.element(getByRole("textbox")).toBeInTheDocument();
});
