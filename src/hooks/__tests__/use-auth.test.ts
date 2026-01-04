import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAuth } from "@/hooks/use-auth";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockSignInAction = vi.fn();
const mockSignUpAction = vi.fn();

vi.mock("@/actions", () => ({
  signIn: (...args: unknown[]) => mockSignInAction(...args),
  signUp: (...args: unknown[]) => mockSignUpAction(...args),
}));

const mockGetAnonWorkData = vi.fn();
const mockClearAnonWork = vi.fn();

vi.mock("@/lib/anon-work-tracker", () => ({
  getAnonWorkData: () => mockGetAnonWorkData(),
  clearAnonWork: () => mockClearAnonWork(),
}));

const mockGetProjects = vi.fn();
const mockCreateProject = vi.fn();

vi.mock("@/actions/get-projects", () => ({
  getProjects: () => mockGetProjects(),
}));

vi.mock("@/actions/create-project", () => ({
  createProject: (input: unknown) => mockCreateProject(input),
}));

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("should return isLoading as false initially", () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);
    });

    it("should return signIn and signUp functions", () => {
      const { result } = renderHook(() => useAuth());

      expect(typeof result.current.signIn).toBe("function");
      expect(typeof result.current.signUp).toBe("function");
    });
  });

  describe("signIn", () => {
    describe("happy path", () => {
      it("should return success result when signIn succeeds", async () => {
        mockSignInAction.mockResolvedValue({ success: true });
        mockGetAnonWorkData.mockReturnValue(null);
        mockGetProjects.mockResolvedValue([{ id: "project-1" }]);

        const { result } = renderHook(() => useAuth());

        let signInResult;
        await act(async () => {
          signInResult = await result.current.signIn(
            "test@example.com",
            "password123"
          );
        });

        expect(signInResult).toEqual({ success: true });
        expect(mockSignInAction).toHaveBeenCalledWith(
          "test@example.com",
          "password123"
        );
      });

      it("should redirect to project from anonymous work when present", async () => {
        mockSignInAction.mockResolvedValue({ success: true });
        mockGetAnonWorkData.mockReturnValue({
          messages: [{ role: "user", content: "test" }],
          fileSystemData: { "/": {} },
        });
        mockCreateProject.mockResolvedValue({ id: "new-anon-project" });

        const { result } = renderHook(() => useAuth());

        await act(async () => {
          await result.current.signIn("test@example.com", "password123");
        });

        expect(mockCreateProject).toHaveBeenCalledWith(
          expect.objectContaining({
            messages: [{ role: "user", content: "test" }],
            data: { "/": {} },
          })
        );
        expect(mockClearAnonWork).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith("/new-anon-project");
      });

      it("should redirect to most recent project when no anonymous work", async () => {
        mockSignInAction.mockResolvedValue({ success: true });
        mockGetAnonWorkData.mockReturnValue(null);
        mockGetProjects.mockResolvedValue([
          { id: "recent-project" },
          { id: "older-project" },
        ]);

        const { result } = renderHook(() => useAuth());

        await act(async () => {
          await result.current.signIn("test@example.com", "password123");
        });

        expect(mockGetProjects).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith("/recent-project");
      });

      it("should create new project when user has no existing projects", async () => {
        mockSignInAction.mockResolvedValue({ success: true });
        mockGetAnonWorkData.mockReturnValue(null);
        mockGetProjects.mockResolvedValue([]);
        mockCreateProject.mockResolvedValue({ id: "brand-new-project" });

        const { result } = renderHook(() => useAuth());

        await act(async () => {
          await result.current.signIn("test@example.com", "password123");
        });

        expect(mockCreateProject).toHaveBeenCalledWith(
          expect.objectContaining({
            messages: [],
            data: {},
          })
        );
        expect(mockPush).toHaveBeenCalledWith("/brand-new-project");
      });

      it("should ignore empty anonymous work messages", async () => {
        mockSignInAction.mockResolvedValue({ success: true });
        mockGetAnonWorkData.mockReturnValue({
          messages: [],
          fileSystemData: {},
        });
        mockGetProjects.mockResolvedValue([{ id: "existing-project" }]);

        const { result } = renderHook(() => useAuth());

        await act(async () => {
          await result.current.signIn("test@example.com", "password123");
        });

        expect(mockClearAnonWork).not.toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith("/existing-project");
      });
    });

    describe("error state", () => {
      it("should return error result when signIn fails", async () => {
        mockSignInAction.mockResolvedValue({
          success: false,
          error: "Invalid credentials",
        });

        const { result } = renderHook(() => useAuth());

        let signInResult;
        await act(async () => {
          signInResult = await result.current.signIn(
            "test@example.com",
            "wrongpassword"
          );
        });

        expect(signInResult).toEqual({
          success: false,
          error: "Invalid credentials",
        });
        expect(mockPush).not.toHaveBeenCalled();
      });

      it("should not call handlePostSignIn when signIn fails", async () => {
        mockSignInAction.mockResolvedValue({
          success: false,
          error: "Invalid credentials",
        });

        const { result } = renderHook(() => useAuth());

        await act(async () => {
          await result.current.signIn("test@example.com", "wrongpassword");
        });

        expect(mockGetAnonWorkData).not.toHaveBeenCalled();
        expect(mockGetProjects).not.toHaveBeenCalled();
        expect(mockCreateProject).not.toHaveBeenCalled();
      });
    });

    describe("loading state", () => {
      it("should set isLoading to true during signIn", async () => {
        let resolveSignIn: (value: { success: boolean }) => void;
        mockSignInAction.mockReturnValue(
          new Promise((resolve) => {
            resolveSignIn = resolve;
          })
        );
        mockGetAnonWorkData.mockReturnValue(null);
        mockGetProjects.mockResolvedValue([{ id: "project-1" }]);

        const { result } = renderHook(() => useAuth());

        expect(result.current.isLoading).toBe(false);

        let signInPromise: Promise<unknown>;
        act(() => {
          signInPromise = result.current.signIn(
            "test@example.com",
            "password123"
          );
        });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(true);
        });

        await act(async () => {
          resolveSignIn!({ success: true });
          await signInPromise;
        });

        expect(result.current.isLoading).toBe(false);
      });

      it("should set isLoading to false even when signIn throws", async () => {
        mockSignInAction.mockRejectedValue(new Error("Network error"));

        const { result } = renderHook(() => useAuth());

        await act(async () => {
          try {
            await result.current.signIn("test@example.com", "password123");
          } catch {
            // Expected to throw
          }
        });

        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe("signUp", () => {
    describe("happy path", () => {
      it("should return success result when signUp succeeds", async () => {
        mockSignUpAction.mockResolvedValue({ success: true });
        mockGetAnonWorkData.mockReturnValue(null);
        mockGetProjects.mockResolvedValue([{ id: "project-1" }]);

        const { result } = renderHook(() => useAuth());

        let signUpResult;
        await act(async () => {
          signUpResult = await result.current.signUp(
            "newuser@example.com",
            "password123"
          );
        });

        expect(signUpResult).toEqual({ success: true });
        expect(mockSignUpAction).toHaveBeenCalledWith(
          "newuser@example.com",
          "password123"
        );
      });

      it("should redirect to project from anonymous work when present", async () => {
        mockSignUpAction.mockResolvedValue({ success: true });
        mockGetAnonWorkData.mockReturnValue({
          messages: [{ role: "assistant", content: "Generated component" }],
          fileSystemData: { "/App.tsx": "content" },
        });
        mockCreateProject.mockResolvedValue({ id: "signup-anon-project" });

        const { result } = renderHook(() => useAuth());

        await act(async () => {
          await result.current.signUp("newuser@example.com", "password123");
        });

        expect(mockCreateProject).toHaveBeenCalledWith(
          expect.objectContaining({
            messages: [{ role: "assistant", content: "Generated component" }],
            data: { "/App.tsx": "content" },
          })
        );
        expect(mockClearAnonWork).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith("/signup-anon-project");
      });

      it("should redirect to most recent project when no anonymous work", async () => {
        mockSignUpAction.mockResolvedValue({ success: true });
        mockGetAnonWorkData.mockReturnValue(null);
        mockGetProjects.mockResolvedValue([
          { id: "first-project" },
          { id: "second-project" },
        ]);

        const { result } = renderHook(() => useAuth());

        await act(async () => {
          await result.current.signUp("newuser@example.com", "password123");
        });

        expect(mockPush).toHaveBeenCalledWith("/first-project");
      });

      it("should create new project for new user with no projects", async () => {
        mockSignUpAction.mockResolvedValue({ success: true });
        mockGetAnonWorkData.mockReturnValue(null);
        mockGetProjects.mockResolvedValue([]);
        mockCreateProject.mockResolvedValue({ id: "new-user-project" });

        const { result } = renderHook(() => useAuth());

        await act(async () => {
          await result.current.signUp("newuser@example.com", "password123");
        });

        expect(mockCreateProject).toHaveBeenCalledWith(
          expect.objectContaining({
            messages: [],
            data: {},
          })
        );
        expect(mockPush).toHaveBeenCalledWith("/new-user-project");
      });
    });

    describe("error state", () => {
      it("should return error result when signUp fails with duplicate email", async () => {
        mockSignUpAction.mockResolvedValue({
          success: false,
          error: "Email already registered",
        });

        const { result } = renderHook(() => useAuth());

        let signUpResult;
        await act(async () => {
          signUpResult = await result.current.signUp(
            "existing@example.com",
            "password123"
          );
        });

        expect(signUpResult).toEqual({
          success: false,
          error: "Email already registered",
        });
        expect(mockPush).not.toHaveBeenCalled();
      });

      it("should return error result when signUp fails with invalid password", async () => {
        mockSignUpAction.mockResolvedValue({
          success: false,
          error: "Password must be at least 8 characters",
        });

        const { result } = renderHook(() => useAuth());

        let signUpResult;
        await act(async () => {
          signUpResult = await result.current.signUp(
            "newuser@example.com",
            "short"
          );
        });

        expect(signUpResult).toEqual({
          success: false,
          error: "Password must be at least 8 characters",
        });
      });

      it("should not call handlePostSignIn when signUp fails", async () => {
        mockSignUpAction.mockResolvedValue({
          success: false,
          error: "Sign up failed",
        });

        const { result } = renderHook(() => useAuth());

        await act(async () => {
          await result.current.signUp("newuser@example.com", "password123");
        });

        expect(mockGetAnonWorkData).not.toHaveBeenCalled();
        expect(mockGetProjects).not.toHaveBeenCalled();
        expect(mockCreateProject).not.toHaveBeenCalled();
      });
    });

    describe("loading state", () => {
      it("should set isLoading to true during signUp", async () => {
        let resolveSignUp: (value: { success: boolean }) => void;
        mockSignUpAction.mockReturnValue(
          new Promise((resolve) => {
            resolveSignUp = resolve;
          })
        );
        mockGetAnonWorkData.mockReturnValue(null);
        mockGetProjects.mockResolvedValue([{ id: "project-1" }]);

        const { result } = renderHook(() => useAuth());

        expect(result.current.isLoading).toBe(false);

        let signUpPromise: Promise<unknown>;
        act(() => {
          signUpPromise = result.current.signUp(
            "newuser@example.com",
            "password123"
          );
        });

        await waitFor(() => {
          expect(result.current.isLoading).toBe(true);
        });

        await act(async () => {
          resolveSignUp!({ success: true });
          await signUpPromise;
        });

        expect(result.current.isLoading).toBe(false);
      });

      it("should set isLoading to false even when signUp throws", async () => {
        mockSignUpAction.mockRejectedValue(new Error("Network error"));

        const { result } = renderHook(() => useAuth());

        await act(async () => {
          try {
            await result.current.signUp("newuser@example.com", "password123");
          } catch {
            // Expected to throw
          }
        });

        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe("handlePostSignIn edge cases", () => {
    it("should handle null anonWorkData gracefully", async () => {
      mockSignInAction.mockResolvedValue({ success: true });
      mockGetAnonWorkData.mockReturnValue(null);
      mockGetProjects.mockResolvedValue([{ id: "fallback-project" }]);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password123");
      });

      expect(mockClearAnonWork).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/fallback-project");
    });

    it("should handle anonWorkData with empty messages array", async () => {
      mockSignUpAction.mockResolvedValue({ success: true });
      mockGetAnonWorkData.mockReturnValue({
        messages: [],
        fileSystemData: { "/App.tsx": "content" },
      });
      mockGetProjects.mockResolvedValue([{ id: "existing" }]);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp("test@example.com", "password123");
      });

      expect(mockClearAnonWork).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/existing");
    });

    it("should use dynamic project name with timestamp when saving anon work", async () => {
      const mockDate = new Date("2024-06-15T10:30:00");
      vi.setSystemTime(mockDate);

      mockSignInAction.mockResolvedValue({ success: true });
      mockGetAnonWorkData.mockReturnValue({
        messages: [{ role: "user", content: "create a button" }],
        fileSystemData: {},
      });
      mockCreateProject.mockResolvedValue({ id: "timestamped-project" });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password123");
      });

      expect(mockCreateProject).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.stringContaining("Design from"),
        })
      );

      vi.useRealTimers();
    });

    it("should use random project name when creating new project for user with no projects", async () => {
      mockSignUpAction.mockResolvedValue({ success: true });
      mockGetAnonWorkData.mockReturnValue(null);
      mockGetProjects.mockResolvedValue([]);
      mockCreateProject.mockResolvedValue({ id: "random-named-project" });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp("test@example.com", "password123");
      });

      expect(mockCreateProject).toHaveBeenCalledWith(
        expect.objectContaining({
          name: expect.stringMatching(/^New Design #\d+$/),
        })
      );
    });
  });
});
