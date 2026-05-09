import { Bin } from "../types/bin";

const API_URL = "/api/bins";

export const binService = {
  async getAll(): Promise<Bin[]> {
    const res = await fetch(API_URL);

    if (!res.ok) {
      console.error("GET /bins failed:", res.status);
      return [];
    }

    const text = await res.text();

    if (!text) return []; // 👈 يمنع الكراش

    try {
      return JSON.parse(text);
    } catch (err) {
      console.error("Invalid JSON:", text);
      return [];
    }
  },

  async create(name: string, file?: File | null) {
    const formData = new FormData();
    formData.append("name", name);
    if (file) formData.append("file", file);

    const res = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      console.error("POST /bins failed:", res.status);
    }
  },

  async delete(id: number) {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      console.error("DELETE failed:", res.status);
    }
  },
};