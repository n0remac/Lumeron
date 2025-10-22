"use client";

import { useState } from "react";

export default function GenerateForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData(e.currentTarget);
    const data = {
      prompt: formData.get("prompt"),
      theme: formData.get("theme"),
      count: parseInt(formData.get("count") as string),
    };

    try {
      const response = await fetch("/api/admin/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(`Successfully generated ${result.count} design(s)!`);
        e.currentTarget.reset();
      } else {
        setMessage(`Error: ${result.error || "Generation failed"}`);
      }
    } catch (error) {
      setMessage("Error generating design");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text">AI Prompt</span>
        </label>
        <textarea
          name="prompt"
          placeholder="Describe the sticker design you want to generate..."
          className="textarea textarea-bordered"
          rows={4}
          required
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Theme (optional)</span>
        </label>
        <input
          type="text"
          name="theme"
          placeholder="e.g., neon rave, cyberpunk"
          className="input input-bordered"
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Number of variations</span>
        </label>
        <input
          type="number"
          name="count"
          min="1"
          max="8"
          defaultValue="1"
          className="input input-bordered"
          required
        />
      </div>

      {message && (
        <div
          className={`alert ${message.startsWith("Error") ? "alert-error" : "alert-success"}`}
        >
          {message}
        </div>
      )}

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "Generating..." : "Generate Design"}
      </button>
    </form>
  );
}
