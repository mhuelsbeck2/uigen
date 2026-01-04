import { Loader2 } from "lucide-react";
import type { ToolInvocation } from "@ai-sdk/ui-utils";

interface ToolInvocationDisplayProps {
  toolInvocation: ToolInvocation;
}

function getDisplayMessage(
  toolName: string,
  command: string | undefined,
  path: string | undefined,
  isComplete: boolean
): string {
  const fileName = path || "file";

  if (toolName === "str_replace_editor") {
    switch (command) {
      case "create":
        return isComplete ? `Created ${fileName}` : `Creating ${fileName}`;
      case "str_replace":
        return isComplete ? `Edited ${fileName}` : `Editing ${fileName}`;
      case "insert":
        return isComplete
          ? `Inserted into ${fileName}`
          : `Inserting into ${fileName}`;
      case "view":
        return isComplete ? `Viewed ${fileName}` : `Viewing ${fileName}`;
      case "undo_edit":
        return isComplete
          ? `Undid changes to ${fileName}`
          : `Undoing changes to ${fileName}`;
      default:
        return isComplete ? `Completed ${toolName}` : `Running ${toolName}`;
    }
  }

  if (toolName === "file_manager") {
    switch (command) {
      case "rename":
        return isComplete ? `Renamed ${fileName}` : `Renaming ${fileName}`;
      case "delete":
        return isComplete ? `Deleted ${fileName}` : `Deleting ${fileName}`;
      default:
        return isComplete ? `Completed ${toolName}` : `Running ${toolName}`;
    }
  }

  return isComplete ? `Completed ${toolName}` : `Running ${toolName}`;
}

export function ToolInvocationDisplay({
  toolInvocation,
}: ToolInvocationDisplayProps) {
  const { toolName, state, args } = toolInvocation;
  const isComplete = state === "result" && "result" in toolInvocation;

  const command = args?.command as string | undefined;
  const path = args?.path as string | undefined;

  const message = getDisplayMessage(toolName, command, path, isComplete);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {isComplete ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{message}</span>
    </div>
  );
}
