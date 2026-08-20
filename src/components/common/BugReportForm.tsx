"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function BugReportForm() {
  const [bugTitle, setBugTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleReset = () => {
    setBugTitle("");
    setDescription("");
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const response = await fetch(
      "http://localhost:5000/api/bugs",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bug_title: bugTitle,
          description: description,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Failed to submit bug report"
      );
    }

    console.log("Bug report submitted:", data);

    alert("Bug reported successfully!");

    handleReset();

  } catch (error) {
    console.error(
      "Bug report submission error:",
      error
    );

    alert(
      error instanceof Error
        ? error.message
        : "Failed to submit bug report"
    );
  }
};

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Bug Report</CardTitle>

        <CardDescription>
          Help us improve by reporting bugs you encounter.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Bug Title */}
          <div className="space-y-2">
            <Label htmlFor="bug-title">Bug Title</Label>

            <Input
              id="bug-title"
              value={bugTitle}
              onChange={(e) => setBugTitle(e.target.value)}
              placeholder="Login button not working on mobile"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>

            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="I'm having an issue with the login button on mobile."
              maxLength={1000}
              className="min-h-[140px]"
              required
            />

            <p className="text-sm text-muted-foreground">
              {description.length}/1000 characters
            </p>

            <p className="text-sm text-muted-foreground">
              Include steps to reproduce, expected behavior, and what actually
              happened.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
            >
              Reset
            </Button>

            <Button type="submit">
              Submit
            </Button>
          </div>

        </form>
      </CardContent>
    </Card>
  );
}