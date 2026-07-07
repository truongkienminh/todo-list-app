import { ApiError } from "@/lib/api-client";
import { getTasks } from "@/lib/task-service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  try {
    const taskPage = await getTasks({
      page: 0,
      size: 10,
      sort: "createdAt,desc",
    });

    console.log("Fetched tasks from backend:", taskPage);

    return (
      <main className="mx-auto min-h-screen max-w-3xl px-6 py-12">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-semibold text-slate-900">Todo List</h1>
          <p className="mt-2 text-sm text-slate-600">
            Temporary scaffold page. Data was fetched from the Spring Boot backend.
          </p>

          <div className="mt-6 rounded-lg bg-slate-100 p-4 text-sm text-slate-700">
            <p>Total tasks: {taskPage.totalElements}</p>
            <p>
              Current page: {taskPage.number + 1} / {Math.max(taskPage.totalPages, 1)}
            </p>
          </div>

          <ul className="mt-6 space-y-3">
            {taskPage.content.map((task) => (
              <li
                key={task.id}
                className="rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-800"
              >
                <p className="font-medium">{task.title}</p>
                <p className="mt-1 text-slate-600">
                  {task.status} | {task.priority}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </main>
    );
  } catch (error) {
    const message =
      error instanceof ApiError ? error.message : "Unable to reach the backend service.";

    console.error("Failed to fetch tasks:", error);

    return (
      <main className="mx-auto min-h-screen max-w-3xl px-6 py-12">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
          <h1 className="text-3xl font-semibold text-red-900">Todo List</h1>
          <p className="mt-3 text-sm">
            Temporary scaffold page. Backend request failed: {message}
          </p>
        </div>
      </main>
    );
  }
}
