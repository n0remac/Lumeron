"use client";

import { useState } from "react";

export default function UploadForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(true);
    setMessage("");

    const formData = new FormData(form);

    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch {
        // Ignore JSON parsing errors so we can still surface success/failure
      }

      if (response.ok && (!data || data.success)) {
        setMessage("Upload successful!");
        form.reset();
      } else {
        const errorMessage =
          (data && data.error) || "Upload failed. Please try again.";
        setMessage(`Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Upload request failed", error);
      setMessage("Error uploading file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Title</span>
        </label>
        <input
          type="text"
          name="title"
          placeholder="Sticker title"
          className="input input-bordered"
          required
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Description</span>
        </label>
        <textarea
          name="description"
          placeholder="Product description"
          className="textarea textarea-bordered"
          rows={3}
          required
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Tags (comma-separated)</span>
        </label>
        <input
          type="text"
          name="tags"
          placeholder="rave, sticker, neon"
          className="input input-bordered"
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Size (inches)</span>
        </label>
        <select name="sizeInches" className="select select-bordered" required>
          <option value="2">2"</option>
          <option value="3">3"</option>
          <option value="4">4"</option>
        </select>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Finish</span>
        </label>
        <select name="finish" className="select select-bordered" required>
          <option value="glossy">Glossy</option>
          <option value="matte">Matte</option>
        </select>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Upload PNG File</span>
        </label>
        <input
          type="file"
          name="file"
          accept="image/png"
          className="file-input file-input-bordered"
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
        {loading ? "Uploading..." : "Upload Sticker"}
      </button>
    </form>
  );
}
