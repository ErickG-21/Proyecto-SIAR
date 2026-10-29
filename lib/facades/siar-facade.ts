export type LoginUser = { id: string; name: string; email: string; role: "ADMIN" | "WAITER" };

export class SiarFacade {
  async login(email: string, password: string): Promise<LoginUser> {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data: { user?: LoginUser; message?: string } = await response.json();
    if (!response.ok || !data.user) {
      throw new Error(data.message || "No se pudo iniciar sesión.");
    }

    return data.user;
  }
}

export const siarFacade = new SiarFacade();
