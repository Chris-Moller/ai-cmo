import { Button, Input } from '@chief-mog-officer/ui';
import type { FormEvent } from 'react';

export function ProjectCreate() {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  return (
    <div>
      <h2 className="font-display text-lg font-bold text-text-primary uppercase tracking-wider mb-6">
        New Project
      </h2>
      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="bg-bg-secondary border border-border rounded p-6 flex flex-col gap-5">
          <Input
            label="Project Name"
            name="name"
            placeholder="e.g. Acme Corp Competitive Intel"
            required
          />
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="description"
              className="text-xs font-display font-medium text-text-secondary uppercase tracking-wider"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Brief description of the project goals..."
              className="bg-bg-primary border border-border rounded px-3 py-2 text-sm text-text-primary font-body placeholder:text-text-secondary/50 focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/30 transition-colors resize-none"
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary">
              CREATE PROJECT
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
