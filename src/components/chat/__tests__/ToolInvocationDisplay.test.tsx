import { test, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationDisplay } from "../ToolInvocationDisplay";
import type { ToolInvocation } from "@ai-sdk/ui-utils";

vi.mock("lucide-react", () => ({
  Loader2: ({ className }: { className?: string }) => (
    <div data-testid="loader" className={className}>
      Loader
    </div>
  ),
}));

afterEach(() => {
  cleanup();
});

function createToolInvocation(
  overrides: Partial<ToolInvocation> & { state: ToolInvocation["state"] }
): ToolInvocation {
  const base = {
    toolCallId: "test-id",
    toolName: "str_replace_editor",
    args: {},
  };

  if (overrides.state === "result") {
    return {
      ...base,
      ...overrides,
      state: "result",
      result: overrides.result ?? "Success",
    } as ToolInvocation;
  }

  return {
    ...base,
    ...overrides,
  } as ToolInvocation;
}

// str_replace_editor - create command
test("renders 'Creating' for str_replace_editor create command in progress", () => {
  const toolInvocation = createToolInvocation({
    state: "call",
    toolName: "str_replace_editor",
    args: { command: "create", path: "src/Button.tsx" },
  });

  render(<ToolInvocationDisplay toolInvocation={toolInvocation} />);
  expect(screen.getByText("Creating src/Button.tsx")).toBeDefined();
  expect(screen.getByTestId("loader")).toBeDefined();
});

test("renders 'Created' for str_replace_editor create command complete", () => {
  const toolInvocation = createToolInvocation({
    state: "result",
    toolName: "str_replace_editor",
    args: { command: "create", path: "src/Button.tsx" },
    result: "Success",
  });

  render(<ToolInvocationDisplay toolInvocation={toolInvocation} />);
  expect(screen.getByText("Created src/Button.tsx")).toBeDefined();
  expect(screen.queryByTestId("loader")).toBeNull();
});

// str_replace_editor - str_replace command
test("renders 'Editing' for str_replace_editor str_replace command in progress", () => {
  const toolInvocation = createToolInvocation({
    state: "call",
    toolName: "str_replace_editor",
    args: { command: "str_replace", path: "src/App.tsx" },
  });

  render(<ToolInvocationDisplay toolInvocation={toolInvocation} />);
  expect(screen.getByText("Editing src/App.tsx")).toBeDefined();
});

test("renders 'Edited' for str_replace_editor str_replace command complete", () => {
  const toolInvocation = createToolInvocation({
    state: "result",
    toolName: "str_replace_editor",
    args: { command: "str_replace", path: "src/App.tsx" },
    result: "Success",
  });

  render(<ToolInvocationDisplay toolInvocation={toolInvocation} />);
  expect(screen.getByText("Edited src/App.tsx")).toBeDefined();
});

// str_replace_editor - insert command
test("renders 'Inserting into' for insert command in progress", () => {
  const toolInvocation = createToolInvocation({
    state: "call",
    toolName: "str_replace_editor",
    args: { command: "insert", path: "src/utils.ts" },
  });

  render(<ToolInvocationDisplay toolInvocation={toolInvocation} />);
  expect(screen.getByText("Inserting into src/utils.ts")).toBeDefined();
});

test("renders 'Inserted into' for insert command complete", () => {
  const toolInvocation = createToolInvocation({
    state: "result",
    toolName: "str_replace_editor",
    args: { command: "insert", path: "src/utils.ts" },
    result: "Success",
  });

  render(<ToolInvocationDisplay toolInvocation={toolInvocation} />);
  expect(screen.getByText("Inserted into src/utils.ts")).toBeDefined();
});

// str_replace_editor - view command
test("renders 'Viewing' for view command in progress", () => {
  const toolInvocation = createToolInvocation({
    state: "call",
    toolName: "str_replace_editor",
    args: { command: "view", path: "src/index.ts" },
  });

  render(<ToolInvocationDisplay toolInvocation={toolInvocation} />);
  expect(screen.getByText("Viewing src/index.ts")).toBeDefined();
});

test("renders 'Viewed' for view command complete", () => {
  const toolInvocation = createToolInvocation({
    state: "result",
    toolName: "str_replace_editor",
    args: { command: "view", path: "src/index.ts" },
    result: "file contents",
  });

  render(<ToolInvocationDisplay toolInvocation={toolInvocation} />);
  expect(screen.getByText("Viewed src/index.ts")).toBeDefined();
});

// str_replace_editor - undo_edit command
test("renders 'Undoing changes to' for undo_edit command in progress", () => {
  const toolInvocation = createToolInvocation({
    state: "call",
    toolName: "str_replace_editor",
    args: { command: "undo_edit", path: "src/App.tsx" },
  });

  render(<ToolInvocationDisplay toolInvocation={toolInvocation} />);
  expect(screen.getByText("Undoing changes to src/App.tsx")).toBeDefined();
});

test("renders 'Undid changes to' for undo_edit command complete", () => {
  const toolInvocation = createToolInvocation({
    state: "result",
    toolName: "str_replace_editor",
    args: { command: "undo_edit", path: "src/App.tsx" },
    result: "Success",
  });

  render(<ToolInvocationDisplay toolInvocation={toolInvocation} />);
  expect(screen.getByText("Undid changes to src/App.tsx")).toBeDefined();
});

// file_manager - rename command
test("renders 'Renaming' for file_manager rename command in progress", () => {
  const toolInvocation = createToolInvocation({
    state: "call",
    toolName: "file_manager",
    args: { command: "rename", path: "src/old.tsx" },
  });

  render(<ToolInvocationDisplay toolInvocation={toolInvocation} />);
  expect(screen.getByText("Renaming src/old.tsx")).toBeDefined();
});

test("renders 'Renamed' for file_manager rename command complete", () => {
  const toolInvocation = createToolInvocation({
    state: "result",
    toolName: "file_manager",
    args: { command: "rename", path: "src/old.tsx" },
    result: "Success",
  });

  render(<ToolInvocationDisplay toolInvocation={toolInvocation} />);
  expect(screen.getByText("Renamed src/old.tsx")).toBeDefined();
});

// file_manager - delete command
test("renders 'Deleting' for file_manager delete command in progress", () => {
  const toolInvocation = createToolInvocation({
    state: "call",
    toolName: "file_manager",
    args: { command: "delete", path: "src/temp.tsx" },
  });

  render(<ToolInvocationDisplay toolInvocation={toolInvocation} />);
  expect(screen.getByText("Deleting src/temp.tsx")).toBeDefined();
});

test("renders 'Deleted' for file_manager delete command complete", () => {
  const toolInvocation = createToolInvocation({
    state: "result",
    toolName: "file_manager",
    args: { command: "delete", path: "src/temp.tsx" },
    result: "Success",
  });

  render(<ToolInvocationDisplay toolInvocation={toolInvocation} />);
  expect(screen.getByText("Deleted src/temp.tsx")).toBeDefined();
});

// Unknown tool fallback
test("falls back to tool name for unknown tools in progress", () => {
  const toolInvocation = createToolInvocation({
    state: "call",
    toolName: "unknown_tool",
    args: {},
  });

  render(<ToolInvocationDisplay toolInvocation={toolInvocation} />);
  expect(screen.getByText("Running unknown_tool")).toBeDefined();
});

test("falls back to tool name for unknown tools complete", () => {
  const toolInvocation = createToolInvocation({
    state: "result",
    toolName: "unknown_tool",
    args: {},
    result: "Done",
  });

  render(<ToolInvocationDisplay toolInvocation={toolInvocation} />);
  expect(screen.getByText("Completed unknown_tool")).toBeDefined();
});

// Edge cases
test("handles missing path gracefully", () => {
  const toolInvocation = createToolInvocation({
    state: "call",
    toolName: "str_replace_editor",
    args: { command: "create" },
  });

  render(<ToolInvocationDisplay toolInvocation={toolInvocation} />);
  expect(screen.getByText("Creating file")).toBeDefined();
});

test("handles undefined args gracefully", () => {
  const toolInvocation = createToolInvocation({
    state: "call",
    toolName: "str_replace_editor",
    args: undefined as unknown as Record<string, unknown>,
  });

  render(<ToolInvocationDisplay toolInvocation={toolInvocation} />);
  expect(screen.getByText("Running str_replace_editor")).toBeDefined();
});

test("shows spinner for partial-call state", () => {
  const toolInvocation = createToolInvocation({
    state: "partial-call",
    toolName: "str_replace_editor",
    args: { command: "create", path: "src/New.tsx" },
  });

  render(<ToolInvocationDisplay toolInvocation={toolInvocation} />);
  expect(screen.getByTestId("loader")).toBeDefined();
  expect(screen.getByText("Creating src/New.tsx")).toBeDefined();
});

test("shows green dot for result state", () => {
  const toolInvocation = createToolInvocation({
    state: "result",
    toolName: "str_replace_editor",
    args: { command: "create", path: "src/New.tsx" },
    result: "Success",
  });

  const { container } = render(
    <ToolInvocationDisplay toolInvocation={toolInvocation} />
  );
  const greenDot = container.querySelector(".bg-emerald-500");
  expect(greenDot).toBeDefined();
  expect(screen.queryByTestId("loader")).toBeNull();
});
